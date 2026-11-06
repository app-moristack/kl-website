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

    public static function record(Model $model, string $type, int $userId, string $action): void
    {
        Revision::create(['subject_type' => $type, 'subject_id' => $model->id, 'version' => $model->version, 'snapshot' => $model->toArray(), 'user_id' => $userId, 'action' => $action]);
        ActivityLog::create(['user_id' => $userId, 'action' => $type.'.'.$action, 'details' => ['id' => $model->id, 'slug' => $model->slug, 'version' => $model->version]]);
    }
}
