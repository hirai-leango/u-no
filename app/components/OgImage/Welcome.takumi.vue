<script setup lang="ts">
withDefaults(defineProps<{
  name?: string
  count?: number
  comment?: string
  fromName?: string
  fromPhoto?: string
  fromHeadline?: string
}>(), {
  name: '',
  count: 0,
  comment: '',
  fromName: '',
  fromPhoto: '',
  fromHeadline: '',
})
</script>

<template>
  <div
    :style="{
      position: 'relative',
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: '#1F4B7A',
      fontFamily: 'Noto Sans JP, sans-serif',
      padding: '48px 72px',
    }"
  >
    <!-- 湯呑み柄の背景 -->
    <img src="/og-bg.png" :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '630px' }" />

    <!-- 左上ロゴ -->
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <img src="/og-yunomi.png" width="34" height="45" />
      <div :style="{ marginLeft: '12px', fontSize: '26px', fontWeight: 700, color: '#ffffff' }">ユーノーミー</div>
    </div>

    <!-- 見出し -->
    <div :style="{ display: 'flex', fontSize: '26px', fontWeight: 700, color: '#D4A857', marginTop: '22px' }">
      {{ name }}さんへ
    </div>
    <div :style="{ display: 'flex', fontSize: '50px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, marginTop: '4px' }">
      エピソードが届いています
    </div>

    <!-- 本文抜粋 -->
    <div :style="{ display: 'flex', flex: 1, alignItems: 'center' }">
      <div :style="{ fontSize: '34px', fontWeight: 700, color: '#E7EDF3', lineHeight: 1.4 }">
        「{{ comment }}」
      </div>
    </div>

    <!-- 書いた人 -->
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <img
        v-if="fromPhoto"
        :src="fromPhoto"
        width="72"
        height="72"
        :style="{ borderRadius: '36px', border: '4px solid #ffffff', objectFit: 'cover' }"
      />
      <div v-else :style="{ width: '72px', height: '72px', borderRadius: '36px', border: '4px solid #ffffff', backgroundColor: '#3A6091', display: 'flex' }" />
      <div :style="{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }">
        <div :style="{ display: 'flex', fontSize: '28px', fontWeight: 700, color: '#ffffff' }">{{ fromName }}さんより</div>
        <div v-if="fromHeadline" :style="{ display: 'flex', fontSize: '22px', color: '#C9D6E5', marginTop: '4px' }">{{ fromHeadline }}</div>
      </div>
      <div v-if="count > 1" :style="{ display: 'flex', marginLeft: 'auto', fontSize: '24px', color: '#C9D6E5' }">ほか{{ count - 1 }}件の紹介</div>
    </div>
  </div>
</template>
