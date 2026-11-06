<?php

namespace Database\Seeders;

use App\Models\Content;
use App\Models\Page;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Content::firstOrCreate(['slug' => 'official-portraits'], ['type' => 'gallery', 'category' => 'Portraits', 'image' => '/images/portrait.jpg', 'published_at' => now(), 'translations' => ['en' => ['title' => 'Official portraits', 'excerpt' => 'Portrait photographs supplied for this website.', 'body' => 'A selection of the original portrait photographs supplied for this website.', 'status' => 'published'], 'fr' => ['title' => 'Portraits officiels', 'excerpt' => 'Photographies fournies pour ce site.', 'body' => 'Une sélection des photographies originales fournies pour ce site.', 'status' => 'published'], 'km' => ['title' => 'Bann portre ofisiel', 'excerpt' => 'Bann foto ki finn fourni pou sa sit-la.', 'body' => 'Enn seleksion bann foto portre orizinal ki finn fourni pou sa sit-la.', 'status' => 'review', 'reviewed' => false]], 'gallery' => array_map(fn ($image) => ['image' => '/images/'.$image.'.jpg', 'translations' => ['en' => ['caption' => 'Khushal Lobine', 'alt' => 'Portrait of Khushal Lobine'], 'fr' => ['caption' => 'Khushal Lobine', 'alt' => 'Portrait de Khushal Lobine'], 'km' => ['caption' => 'Khushal Lobine', 'alt' => 'Portre Khushal Lobine']]], ['portrait', 'hero', 'standing'])]);
        foreach (json_decode(file_get_contents(database_path('data/pages.json')), true) as $page) {
            Page::firstOrCreate(['slug' => $page['slug']], ['translations' => $page['translations']]);
        }
    }
}
