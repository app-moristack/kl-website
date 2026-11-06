<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\MediaAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index()
    {
        return response()->json(['data' => MediaAsset::latest()->get()->map(fn ($m) => [...$m->toArray(), 'url' => $m->kind === 'image' ? '/storage/'.$m->path : '/api/admin/media/'.$m->id])]);
    }

    public function upload(Request $r)
    {
        $r->validate(['file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:15360']);
        $f = $r->file('file');
        $mime = $f->getMimeType();
        if ($mime === 'application/pdf') {
            abort_unless(str_starts_with(file_get_contents($f->getRealPath(), false, null, 0, 5), '%PDF-'), 422, 'Invalid PDF header.');
            $path = $f->store('documents', 'local');
            $disk = 'local';
            $kind = 'pdf';
        } else {
            abort_if($f->getSize() > 5 * 1024 * 1024, 422, 'Photos must be under 5 MiB.');
            $size = getimagesize($f->getRealPath());
            abort_unless($size && $size[0] * $size[1] <= 20000000, 422, 'Image dimensions are too large.');
            $source = imagecreatefromstring(file_get_contents($f->getRealPath()));
            abort_unless($source, 422, 'Could not decode image.');
            $scale = min(1, 2200 / max($size[0], $size[1]));
            $out = imagecreatetruecolor(max(1, (int) ($size[0] * $scale)), max(1, (int) ($size[1] * $scale)));
            imagealphablending($out, false);
            imagesavealpha($out, true);
            imagecopyresampled($out, $source, 0, 0, 0, 0, imagesx($out), imagesy($out), $size[0], $size[1]);
            ob_start();
            imagewebp($out, null, 88);
            $bytes = ob_get_clean();
            imagedestroy($source);
            imagedestroy($out);
            $path = 'media/'.Str::uuid().'.webp';
            Storage::disk('public')->put($path, $bytes);
            $disk = 'public';
            $kind = 'image';
            $mime = 'image/webp';
        }
        $m = MediaAsset::create(['name' => mb_substr(basename($f->getClientOriginalName()), 0, 200), 'path' => $path, 'kind' => $kind, 'mime' => $mime, 'bytes' => Storage::disk($disk)->size($path), 'user_id' => $r->user()->id]);

        return response()->json(['id' => $m->id, 'name' => $m->name, 'kind' => $kind, 'url' => $kind === 'image' ? '/storage/'.$path : '/documents/'.$m->id], 201);
    }

    public function staffDownload(MediaAsset $asset)
    {
        return Storage::disk($asset->kind === 'pdf' ? 'local' : 'public')->download($asset->path, $asset->name, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function download(Request $r, MediaAsset $asset)
    {
        $locale = $r->query('locale', 'en');
        abort_unless(in_array($locale, ['en', 'fr', 'km'], true) && $asset->kind === 'pdf', 404);
        abort_unless(Content::published($locale)->whereJsonContains('attachments', $asset->id)->exists(), 404);

        return Storage::disk('local')->download($asset->path, $asset->name, ['Content-Type' => 'application/pdf', 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
