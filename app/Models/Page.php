<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['slug', 'translations', 'version', 'updated_by'];

    protected function casts(): array
    {
        return ['translations' => 'array'];
    }

    public function published(string $locale): bool
    {
        $t = $this->translations[$locale] ?? [];
        if (in_array($this->slug, ['privacy', 'terms']) && ! ($t['legal_approved'] ?? false)) {
            return false;
        }

        return ($t['status'] ?? '') === 'published' && ($locale !== 'km' || ($t['reviewed'] ?? false));
    }
}
