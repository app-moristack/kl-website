<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Page;
use App\Models\Revision;
use App\Services\Versions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Page::orderBy('id')->get()]);
    }

    public function published(string $locale)
    {
        abort_unless(in_array($locale, ['en', 'fr', 'km'], true), 404);

        return response()->json(['data' => Page::all()->filter(fn ($p) => $p->published($locale))->mapWithKeys(fn ($p) => [$p->slug => [...collect($p->translations[$locale])->except(['review_notes', 'legal_approved', 'reviewed', 'status'])->all(), 'slug' => $p->slug]])]);
    }

    public function save(Request $r, Page $page)
    {
        if (in_array($page->slug, ['privacy', 'terms'], true)) {
            abort_unless($r->user()->role === 'admin', 403);
        }
        $fields = 'design,eyebrow,hero_title,hero_accent,hero_body,hero_image,hero_background,primary_label,primary_url,secondary_label,secondary_url,intro_title,intro_body,intro_image,quote,signature,section_title,cards,milestones,focus,cta_title,cta_body,cta_image,cta_label,cta_url,seo_title,meta_description,status,reviewed,review_notes,legal_approved';
        $rules = ['version' => 'required|integer|min:0', 'translations' => 'required|array:en,fr,km', 'translations.*' => 'array:'.$fields, 'translations.*.status' => 'required|in:draft,review,approved,published', 'translations.*.reviewed' => 'boolean', 'translations.*.legal_approved' => 'boolean'];
        foreach (explode(',', $fields) as $f) {
            if (in_array($f, ['cards', 'milestones', 'focus', 'reviewed', 'legal_approved', 'status'])) {
                continue;
            }$rules['translations.*.'.$f] = 'nullable|string|max:'.($f === 'intro_body' ? 30000 : ($f === 'hero_body' || $f === 'cta_body' || $f === 'review_notes' ? 3000 : 500));
        }
        foreach (['cards', 'milestones', 'focus'] as $list) {
            $rules["translations.*.$list"] = 'nullable|array|max:16';
            $rules["translations.*.$list.*"] = 'array:title,body,icon,image,url,year';
            foreach (['title', 'body', 'icon', 'image', 'url', 'year'] as $f) {
                $rules["translations.*.$list.*.$f"] = 'nullable|string|max:'.($f === 'body' ? 1500 : 500);
            }
        }
        $d = $r->validate($rules);
        foreach ($d['translations'] as $locale => $t) {
            foreach (['primary_url', 'secondary_url', 'cta_url'] as $key) {
                $this->checkUrl($t[$key] ?? null);
            }
            foreach (['hero_image', 'hero_background', 'intro_image', 'cta_image'] as $key) {
                $this->checkImage($t[$key] ?? null);
            }
            foreach (['cards', 'milestones', 'focus'] as $list) {
                foreach ($t[$list] ?? [] as $card) {
                    $this->checkUrl($card['url'] ?? null);
                    $this->checkImage($card['image'] ?? null);
                }
            }
            abort_if($locale === 'km' && ($t['status'] ?? '') === 'published' && ! ($t['reviewed'] ?? false), 422, 'Kreol must be reviewed before publication.');
            abort_if(in_array($page->slug, ['privacy', 'terms']) && ($t['status'] ?? '') === 'published' && ! ($t['legal_approved'] ?? false), 422, 'Legal pages require explicit owner approval.');
        }

        return response()->json(Versions::save($page, $d, $r->user()->id));
    }

    private function checkUrl(?string $url)
    {
        abort_if($url && ! preg_match('~^(?:/(?!/)[a-zA-Z0-9_/?=&%#.-]*|https://[^\s<>]+)$~', $url), 422, 'Use a relative site path or HTTPS link.');
    }

    private function checkImage(?string $path)
    {
        abort_if($path && ! preg_match('~^/(?:images|storage/media)/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$~', $path), 422, 'Choose an uploaded image.');
    }

    public function revisions(Request $r)
    {
        $d = $r->validate(['type' => 'required|in:content,page', 'id' => 'required|integer']);

        return response()->json(['data' => Revision::with('user:id,name')->where('subject_type', $d['type'])->where('subject_id', $d['id'])->latest('id')->get()]);
    }

    public function restore(Request $r, Revision $revision)
    {
        abort_unless($r->user()->role === 'admin', 403);
        $d = $r->validate(['version' => 'required|integer']);

        return DB::transaction(function () use ($r, $revision, $d) {
            $model = $revision->subject_type === 'page' ? Page::findOrFail($revision->subject_id) : Content::withTrashed()->findOrFail($revision->subject_id);
            $data = collect($revision->snapshot)->only($model->getFillable())->all();
            $data['version'] = $d['version'];
            $data['translations'] = array_map(fn ($t) => [...$t, 'status' => 'draft', 'reviewed' => false], $data['translations']);
            if ($model instanceof Page) {
                $data['translations'] = array_map(fn ($t) => [...$t, 'legal_approved' => false], $data['translations']);
            }
            if ($model instanceof Content) {
                $model->restore();
                $data['published_at'] = null;
            }

            return response()->json(Versions::save($model, $data, $r->user()->id, 'restored'));
        });
    }
}
