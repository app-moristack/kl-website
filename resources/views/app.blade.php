<!doctype html>
<html lang="{{ $locale === 'km' ? 'mfe' : $locale }}" data-locale="{{ $locale }}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ str_ends_with($title, ' | Khushal Lobine') ? $title : $title.' | Khushal Lobine' }}</title><meta name="description" content="{{ $description }}">
<link rel="canonical" href="{{ url()->current() }}">
@foreach($alternates as $lang=>$href)<link rel="alternate" hreflang="{{ $lang === 'km' ? 'mfe' : $lang }}" href="{{ $href }}">@endforeach
<meta property="og:title" content="{{ str_ends_with($title, ' | Khushal Lobine') ? $title : $title.' | Khushal Lobine' }}"><meta property="og:description" content="{{ $description }}"><meta property="og:type" content="{{ isset($content) && $content ? 'article' : 'website' }}"><meta property="og:url" content="{{ url()->current() }}"><meta property="og:image" content="{{ url(isset($content) && $content && $content->image ? $content->image : '/images/portrait.jpg') }}"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{!! json_encode(['@context'=>'https://schema.org','@type'=>isset($content) && $content ? 'Article' : 'WebSite','name'=>$title,'url'=>url()->current(),'inLanguage'=>$locale === 'km' ? 'mfe' : $locale,'author'=>['@type'=>'Person','name'=>'Khushal Lobine']], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
@viteReactRefresh
@vite(['resources/css/app.css','resources/js/app.jsx'])
</head><body><div id="app">@if(!request()->is('admin*'))<main class="container section"><nav><a href="/{{ $locale }}">Khushal Lobine</a> · <a href="/{{ $locale }}/parliament">{{ $locale === 'fr' ? 'Parlement' : 'Parliament' }}</a> · <a href="/{{ $locale }}/contact">Contact</a></nav><h1>{{ $title }}</h1><p>{{ $description }}</p>@if(isset($content) && $content)<article class="article-body">{{ $content->translations[$locale]['body'] ?? '' }}</article>@elseif(isset($page) && $page && $page->published($locale))<article class="article-body">{{ $page->translations[$locale]['intro_body'] ?? '' }}</article>@endif</main>@endif</div>
<noscript><p>JavaScript enables the interactive archive and forms.</p></noscript>
</body></html>
