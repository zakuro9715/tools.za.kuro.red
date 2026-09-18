<script setup lang="ts">
const { t } = useI18n()
const {
  images,
  imageA,
  imageAId,
  imageB,
  imageBId,
  orientation,
  fit,
  position,
  error,
  addFiles,
  removeImage,
  selectImage,
  setPosition,
  toggleFit,
} = useImageCompare()

const isDraggingOver = shallowRef(false)

const displayName = (image: { name: string, isSample: boolean, id: string }) => {
  if (!image.isSample) {
    return image.name
  }
  return image.id === 'sample-a' ? t('samples.a') : t('samples.b')
}

const handleFiles = (files: FileList | null) => {
  if (files) {
    addFiles(files)
  }
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-12">
    <section class="space-y-3 lg:col-span-8">
      <UCard :ui="{ body: 'p-3 sm:p-3' }">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex gap-2">
            <UButton
              data-testid="image-compare-vertical"
              icon="i-lucide-columns-2"
              :label="t('actions.vertical')"
              :color="orientation === 'vertical' ? 'primary' : 'neutral'"
              :variant="orientation === 'vertical' ? 'solid' : 'outline'"
              size="sm"
              @click="orientation = 'vertical'"
            />
            <UButton
              data-testid="image-compare-horizontal"
              icon="i-lucide-rows-2"
              :label="t('actions.horizontal')"
              :color="orientation === 'horizontal' ? 'primary' : 'neutral'"
              :variant="orientation === 'horizontal' ? 'solid' : 'outline'"
              size="sm"
              @click="orientation = 'horizontal'"
            />
          </div>
          <UButton
            data-testid="image-compare-fit"
            :icon="fit === 'cover' ? 'i-lucide-maximize' : 'i-lucide-minimize'"
            :label="fit === 'cover' ? t('actions.cover') : t('actions.contain')"
            color="neutral"
            variant="outline"
            size="sm"
            @click="toggleFit"
          />
        </div>
      </UCard>

      <ImageCompareStage
        :image-a-url="imageA?.url"
        :image-b-url="imageB?.url"
        :orientation="orientation"
        :fit="fit"
        :position="position"
        @set-position="setPosition"
      />
    </section>

    <aside class="space-y-4 lg:col-span-4">
      <UCard>
        <label
          data-testid="image-compare-upload"
          class="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-default p-6 text-center"
          :class="{ 'bg-elevated': isDraggingOver }"
          @dragover.prevent="isDraggingOver = true"
          @dragleave.prevent="isDraggingOver = false"
          @drop.prevent="isDraggingOver = false; handleFiles($event.dataTransfer?.files ?? null)"
        >
          <UIcon
            name="i-lucide-upload"
            class="size-6 text-muted"
          />
          <span class="text-sm">{{ t('upload') }}</span>
          <input
            data-testid="image-compare-file-input"
            class="sr-only"
            type="file"
            accept="image/*"
            multiple
            @change="handleFiles(($event.target as HTMLInputElement).files)"
          >
        </label>
        <UAlert
          v-if="error"
          class="mt-3"
          color="error"
          icon="i-lucide-circle-alert"
          :title="t(`errors.${error}`)"
        />
      </UCard>

      <UCard :ui="{ body: 'space-y-3' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-medium">
              {{ t('library') }}
            </h2>
            <UBadge
              data-testid="image-compare-count"
              color="neutral"
              variant="subtle"
            >
              {{ images.length }}
            </UBadge>
          </div>
        </template>
        <div class="max-h-96 space-y-2 overflow-y-auto">
          <div
            v-for="image in images"
            :key="image.id"
            class="rounded-md border border-default p-2"
            :class="{ 'ring-1 ring-primary': image.id === imageAId || image.id === imageBId }"
          >
            <img
              :src="image.url"
              :alt="displayName(image)"
              class="aspect-video w-full rounded object-cover"
            >
            <p class="mt-2 truncate text-xs text-muted">
              {{ displayName(image) }}
            </p>
            <div class="mt-2 grid grid-cols-3 gap-1">
              <UButton
                data-testid="image-compare-set-a"
                :label="t('actions.setA')"
                size="xs"
                :color="image.id === imageAId ? 'primary' : 'neutral'"
                :variant="image.id === imageAId ? 'solid' : 'outline'"
                @click="selectImage('a', image.id)"
              />
              <UButton
                data-testid="image-compare-set-b"
                :label="t('actions.setB')"
                size="xs"
                :color="image.id === imageBId ? 'primary' : 'neutral'"
                :variant="image.id === imageBId ? 'solid' : 'outline'"
                @click="selectImage('b', image.id)"
              />
              <UButton
                data-testid="image-compare-delete"
                icon="i-lucide-trash-2"
                :aria-label="t('actions.delete')"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeImage(image.id)"
              />
            </div>
          </div>
        </div>
      </UCard>
    </aside>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "actions": {
      "vertical": "Side by side",
      "horizontal": "Top and bottom",
      "cover": "Cover",
      "contain": "Show all",
      "setA": "Set A",
      "setB": "Set B",
      "delete": "Delete image"
    },
    "upload": "Drop images here or choose files",
    "errors": {
      "invalid": "Choose one or more image files.",
      "load": "The image files could not be loaded."
    },
    "library": "Image library",
    "samples": {
      "a": "Sample image A",
      "b": "Sample image B"
    }
  },
  "ja": {
    "actions": {
      "vertical": "左右分割",
      "horizontal": "上下分割",
      "cover": "カバー",
      "contain": "全体表示",
      "setA": "Aに設定",
      "setB": "Bに設定",
      "delete": "画像を削除"
    },
    "upload": "画像をドロップ、またはファイルを選択",
    "errors": {
      "invalid": "画像ファイルを選択してください。",
      "load": "画像ファイルを読み込めませんでした。"
    },
    "library": "画像ライブラリ",
    "samples": {
      "a": "サンプル画像 A",
      "b": "サンプル画像 B"
    }
  }
}
</i18n>
