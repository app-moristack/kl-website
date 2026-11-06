<!doctype html>
<html lang="{{ $locale === 'km' ? 'mfe' : $locale }}" data-locale="{{ $locale }}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ $title }} | Khushal Lobine</title><meta name="description" content="{{ $description }}">
<link rel="canonical" href="{{ url()->current() }}">
@foreach($alternates as $lang=>$href)<link rel="alternate" hreflang="{{ $lang === 'km' ? 'mfe' : $lang }}" href="{{ $href }}">@endforeach
<meta property="og:title" content="{{ $title }} | Khushal Lobine"><meta property="og:description" content="{{ $description }}"><meta property="og:type" content="{{ isset($content) && $content ? 'article' : 'website' }}"><meta property="og:url" content="{{ url()->current() }}"><meta property="og:image" content="{{ url('/images/portrait.jpg') }}"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{!! json_encode(['@context'=>'https://schema.org','@type'=>isset($content) && $content ? 'Article' : 'WebSite','name'=>$title,'url'=>url()->current(),'inLanguage'=>$locale === 'km' ? 'mfe' : $locale,'author'=>['@type'=>'Person','name'=>'Khushal Lobine']], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
@viteReactRefresh
@vite(['resources/css/app.css','resources/js/app.jsx'])
</head><body><div id="app"></div>
<noscript><main><h1>{{ $title }}</h1><p>{{ $description }}</p>@if(isset($content) && $content)<article style="white-space:pre-line">{{ $content->translations[$locale]['body'] ?? '' }}</article>@endif<p>Enable JavaScript for navigation and forms.</p></main></noscript>
</body></html>
