<?php

namespace App\Services;

class Video
{
    public static function embed(?string $url): ?string
    {
        if (! $url) {
            return null;
        }$p = parse_url($url);
        if (! $p || ($p['scheme'] ?? '') !== 'https' || isset($p['user']) || isset($p['pass']) || isset($p['port'])) {
            return null;
        }
        $host = strtolower($p['host'] ?? '');
        $path = $p['path'] ?? '';
        $id = null;
        if (in_array($host, ['www.youtube.com', 'youtube.com', 'm.youtube.com'], true)) {
            parse_str($p['query'] ?? '', $q);
            if ($path === '/watch') {
                $id = $q['v'] ?? null;
            } elseif (preg_match('~^/(?:shorts|embed)/([\w-]{11})/?$~', $path, $m)) {
                $id = $m[1];
            }
        } elseif ($host === 'youtu.be') {
            $id = trim($path, '/');
        }
        if (is_string($id) && preg_match('/^[A-Za-z0-9_-]{11}$/', $id)) {
            return 'https://www.youtube-nocookie.com/embed/'.$id;
        }
        if (in_array($host, ['vimeo.com', 'www.vimeo.com'], true) && preg_match('~^/([0-9]{6,12})/?$~', $path, $m)) {
            return 'https://player.vimeo.com/video/'.$m[1];
        }

        return null;
    }
}
