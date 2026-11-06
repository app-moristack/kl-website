<?php

namespace App\Models;

use App\Services\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Content extends Model
{
    use SoftDeletes;

    protected $fillable = ['slug', 'type', 'category', 'translations', 'image', 'source_url', 'event_date', 'featured', 'position', 'published_at', 'updated_by', 'version', 'parliament_kind', 'session_year', 'question_number', 'ministry', 'topics', 'video_url', 'attachments', 'gallery'];

    protected function casts(): array
    {
        return ['translations' => 'array', 'featured' => 'boolean', 'published_at' => 'datetime', 'event_date' => 'date:Y-m-d', 'topics' => 'array', 'attachments' => 'array', 'gallery' => 'array'];
    }

    public function scopePublished($query, string $locale)
    {
        if ($locale === 'km') {
            $query->where('translations->km->reviewed', true);
        }

        return $query->whereNotNull('published_at')->where('published_at', '<=', now())->where("translations->{$locale}->status", 'published');
    }

    public function localized(string $locale): array
    {
        $t = $this->translations[$locale] ?? [];

        return ['id' => $this->id, 'slug' => $this->slug, 'type' => $this->type, 'category' => $this->category, 'image' => $this->image, 'source_url' => $this->source_url, 'event_date' => $this->event_date?->format('Y-m-d'), 'featured' => $this->featured, 'published_at' => $this->published_at?->toIso8601String(), 'parliament_kind' => $this->parliament_kind, 'session_year' => $this->session_year, 'question_number' => $this->question_number, 'ministry' => $this->ministry, 'topics' => $this->topics ?? [], 'video_url' => $this->video_url, 'embed_url' => Video::embed($this->video_url), 'attachments' => MediaAsset::whereIn('id', $this->attachments ?? [])->where('kind', 'pdf')->get()->map(fn ($a) => ['id' => $a->id, 'name' => $a->name, 'bytes' => $a->bytes, 'url' => '/documents/'.$a->id.'?locale='.$locale])->all(), 'gallery' => array_map(fn ($g) => ['image' => $g['image'], ...($g['translations'][$locale] ?? [])], $this->gallery ?? []), ...$t];
    }
}
