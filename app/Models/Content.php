<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Content extends Model {
 protected $fillable=['slug','type','category','translations','image','source_url','event_date','featured','position','published_at','updated_by'];
 protected function casts(): array {return ['translations'=>'array','featured'=>'boolean','published_at'=>'datetime','event_date'=>'date:Y-m-d'];}
 public function scopePublished($query,string $locale) {return $query->whereNotNull('published_at')->where('published_at','<=',now())->where("translations->{$locale}->status",'published');}
 public function localized(string $locale): array {
  $t=$this->translations[$locale]??[];
  return ['id'=>$this->id,'slug'=>$this->slug,'type'=>$this->type,'category'=>$this->category,'image'=>$this->image,'source_url'=>$this->source_url,'event_date'=>$this->event_date?->format('Y-m-d'),'featured'=>$this->featured,'published_at'=>$this->published_at?->toIso8601String(),...$t];
 }
}
