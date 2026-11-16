<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Page;
use App\Models\Revision;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Versions
{
    public static function save(Model $model, array $data, int $userId, string $action = 'saved'): Model
    {
        return DB::transaction(function () use ($model, $data, $userId, $action) {
            $type = $model instanceof Page ? 'page' : 'content';
            if ($model->exists) {
                $model = $model->newQuery()->lockForUpdate()->findOrFail($model->id);
                if (isset($data['version'])) {
                    abort_if((int) $data['version'] !== (int) $model->version, 409, 'This record changed. Reload before saving.');
                }
                $data = self::invalidateChangedTranslations($model, $data);
                if (! Revision::where('subject_type', $type)->where('subject_id', $model->id)->exists()) {
                    self::record($model, $type, $userId, 'baseline');
                }
            }
            unset($data['version']);
            $model->fill($data);
            $model->version++;
            $model->updated_by = $userId;
            $model->save();
            self::record($model, $type, $userId, $action);

            return $model;
        });
    }

    private static function invalidateChangedTranslations(Model $model, array $data): array
    {
        $reviewFields = ['status', 'reviewed', 'review_notes', 'legal_approved'];
        $legal = $model instanceof Page && in_array($model->slug, ['privacy', 'terms'], true);
        foreach ($data['translations'] ?? [] as $locale => $translation) {
            $previous = $model->translations[$locale] ?? null;
            $galleryChanged = array_key_exists('gallery', $data) &&
                array_map(fn ($photo) => $photo['translations'][$locale] ?? [], $model->gallery ?? []) !=
                array_map(fn ($photo) => $photo['translations'][$locale] ?? [], $data['gallery'] ?? []);
            if (! $previous || (! $galleryChanged && collect($previous)->except($reviewFields)->all() == collect($translation)->except($reviewFields)->all())) {
                continue;
            }
            $translation['reviewed'] = false;
            if ($model instanceof Page) {
                $translation['legal_approved'] = false;
            }
            if (($previous['status'] ?? '') === 'published' || (($locale === 'km' || $legal) && ($translation['status'] ?? '') === 'published')) {
                $translation['status'] = 'draft';
            }
            $data['translations'][$locale] = $translation;
        }

        return $data;
    }

    public static function record(Model $model, string $type, int $userId, string $action): void
    {
        Revision::create(['subject_type' => $type, 'subject_id' => $model->id, 'version' => $model->version, 'snapshot' => $model->toArray(), 'user_id' => $userId, 'action' => $action]);
        ActivityLog::create(['user_id' => $userId, 'action' => $type.'.'.$action, 'details' => ['id' => $model->id, 'slug' => $model->slug, 'version' => $model->version]]);
    }
}
