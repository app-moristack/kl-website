<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Enquiry;
use App\Models\Page;
use App\Models\PageView;
use App\Models\User;
use App\Notifications\EnquiryReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class PublicController extends Controller
{
    public function index(Request $request, string $locale = 'en', ?string $section = null, ?string $slug = null)
    {
        abort_unless(in_array($locale, ['en', 'fr', 'km'], true), 404);
        $allowed = ['about', 'parliament', 'constituency', 'perspectives', 'media', 'contact', 'articles', 'privacy', 'terms', 'updates'];
        abort_if($section && ! in_array($section, $allowed, true), 404);
        abort_if(($slug && $section !== 'articles') || ($section === 'articles' && ! $slug), 404);
        $content = $slug ? Content::published($locale)->where('slug', $slug)->firstOrFail() : null;
        $titles = ['en' => 'A life in law and public service', 'fr' => 'Une vie au service du droit et du public', 'km' => 'Enn lavi dan servis piblik'];
        $title = $content ? ($content->translations[$locale]['title'] ?? '') : ($section ? ucfirst($section) : $titles[$locale]);
        $description = $content ? ($content->translations[$locale]['meta_description'] ?? $content->translations[$locale]['excerpt'] ?? '') : 'Khushal Lobine — Parliament, Constituency No. 15, ideas and public service.';
        $page = Page::where('slug', $section ?: 'home')->first();
        if (! $content && $page && $page->published($locale)) {
            $translation = $page->translations[$locale];
            $title = ($translation['seo_title'] ?? '') ?: ($translation['hero_title'] ?? $title);
            $description = $translation['meta_description'] ?? $description;
        }
        $alternates = [];
        foreach (['en', 'fr', 'km'] as $l) {
            if ($l === 'km' && ! json_decode(DB::table('site_settings')->where('key', 'kreol_interface_approved')->value('value') ?? 'false', true) && $page) {
                continue;
            }
            if (($content && (($content->translations[$l]['status'] ?? '') === 'published') && ($l !== 'km' || ($content->translations[$l]['reviewed'] ?? false))) || (! $content && (! $page || $page->published($l)))) {
                $alternates[$l] = url('/'.$l.($section ? '/'.$section : '').($slug ? '/'.$slug : ''));
            }
        }
        if (! $request->user() && $request->header('DNT') !== '1' && ! preg_match('/bot|crawl|spider|preview|headless/i', $request->userAgent() ?? '')) {
            PageView::create(['day' => today(), 'visitor' => hash_hmac('sha256', today()->toDateString().'|'.$request->session()->getId(), config('app.key')), 'path' => '/'.$locale.($section ? '/'.$section : '').($slug ? '/'.$slug : ''), 'referrer' => mb_substr(parse_url($request->header('referer', ''), PHP_URL_HOST) ?: '', 0, 200) ?: null, 'device' => preg_match('/mobile|android|iphone/i', $request->userAgent() ?? '') ? 'mobile' : 'desktop']);
        }

        return view('app', compact('locale', 'title', 'description', 'alternates', 'content', 'page'));
    }

    public function contents(Request $request, string $locale)
    {
        abort_unless(in_array($locale, ['en', 'fr', 'km'], true), 404);
        $d = $request->validate(['type' => 'nullable|in:article,parliament,media,community,page,gallery', 'q' => 'nullable|string|max:100', 'kind' => 'nullable|in:question,speech,bill,committee,intervention', 'year' => 'nullable|integer|min:1900|max:2200', 'topic' => 'nullable|string|max:80', 'ministry' => 'nullable|string|max:180', 'from' => 'nullable|date', 'to' => 'nullable|date|after_or_equal:from', 'sort' => 'nullable|in:latest,oldest,featured', 'per_page' => 'nullable|integer|min:1|max:100', 'page' => 'nullable|integer|min:1']);
        $base = Content::published($locale);
        if (! empty($d['type'])) {
            $base->where('type', $d['type']);
        }
        $facetRows = (clone $base)->get(['topics', 'session_year', 'ministry']);
        $query = clone $base;
        if (! empty($d['q'])) {
            $query->where(function ($q) use ($locale, $d) {
                foreach (['title', 'excerpt', 'body'] as $field) {
                    $q->orWhere("translations->{$locale}->{$field}", 'like', '%'.$d['q'].'%');
                }
            });
        }
        foreach (['kind' => 'parliament_kind', 'year' => 'session_year', 'ministry' => 'ministry'] as $key => $col) {
            if (! empty($d[$key])) {
                $query->where($col, $d[$key]);
            }
        }
        if (! empty($d['topic'])) {
            $query->whereJsonContains('topics', $d['topic']);
        }
        if (! empty($d['from'])) {
            $query->whereDate('event_date', '>=', $d['from']);
        }if (! empty($d['to'])) {
            $query->whereDate('event_date', '<=', $d['to']);
        }
        if (($d['sort'] ?? 'featured') === 'featured') {
            $query->orderByDesc('featured')->orderBy('position');
        }
        $query->orderBy('published_at', ($d['sort'] ?? '') === 'oldest' ? 'asc' : 'desc')->orderByDesc('id');
        $page = $query->paginate($d['per_page'] ?? 100);

        return response()->json(['data' => $page->getCollection()->map(fn ($c) => $c->localized($locale)), 'meta' => ['page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()], 'facets' => ['topics' => $facetRows->pluck('topics')->flatten()->filter()->unique()->values(), 'years' => $facetRows->pluck('session_year')->filter()->unique()->sortDesc()->values(), 'ministries' => $facetRows->pluck('ministry')->filter()->unique()->values()]]);
    }

    public function showContent(string $locale, string $slug)
    {
        abort_unless(in_array($locale, ['en', 'fr', 'km'], true), 404);

        return response()->json(Content::published($locale)->where('slug', $slug)->firstOrFail()->localized($locale));
    }

    public function settings()
    {
        return response()->json(DB::table('site_settings')->get()->mapWithKeys(fn ($row) => [$row->key => json_decode($row->value, true)]));
    }

    public function enquiry(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'email' => 'required|email|max:254', 'subject' => 'required|string|max:180', 'kind' => 'required|in:general,concern,appointment,media', 'message' => 'required|string|min:10|max:5000', 'locale' => 'required|in:en,fr,km', 'consent' => 'accepted', 'website' => 'nullable|max:0']);
        $enquiry = Enquiry::create(collect($data)->except(['consent', 'website'])->all());
        try {
            Notification::send(User::where('is_active', true)->where('notify_enquiries', true)->whereIn('role', ['admin', 'editor'])->get(), new EnquiryReceived($enquiry->id));
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(['message' => 'Your message has been received.'], 201);
    }

    public function sitemap()
    {
        $urls = [];
        foreach (['en', 'fr', 'km'] as $locale) {
            if ($locale === 'km' && ! json_decode(DB::table('site_settings')->where('key', 'kreol_interface_approved')->value('value') ?? 'false', true)) {
                continue;
            }
            foreach (Page::all() as $p) {
                if ($p->published($locale)) {
                    $urls[] = url('/'.$locale.($p->slug === 'home' ? '' : '/'.$p->slug));
                }
            }foreach (Content::published($locale)->get() as $c) {
                $urls[] = url('/'.$locale.'/articles/'.$c->slug);
            }
        }
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $url) {
            $xml .= '<url><loc>'.htmlspecialchars($url, ENT_XML1).'</loc></url>';
        }

        return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml']);
    }
}
