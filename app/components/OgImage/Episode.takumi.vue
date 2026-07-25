<script setup lang="ts">
withDefaults(defineProps<{
  comment?: string
  fromName?: string
  fromPhoto?: string
  toName?: string
  toPhoto?: string
  relationship?: string
}>(), {
  comment: '',
  fromName: '',
  fromPhoto: '',
  toName: '',
  toPhoto: '',
  relationship: '',
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
      padding: '48px 80px',
    }"
  >
    <!-- 湯呑み柄の背景 -->
    <img src="/og-bg.png" :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '630px' }" />

    <!-- 左上ロゴ -->
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <img src="/og-yunomi.png" width="36" height="47" />
      <div :style="{ marginLeft: '14px', fontSize: '28px', fontWeight: 700, color: '#ffffff' }">ユーノーミー</div>
    </div>

    <!-- 誰から誰へ（from → to）: 2アバター＋矢印 -->
    <div :style="{ display: 'flex', alignItems: 'center', marginTop: '30px' }">
      <!-- from（書いた人） -->
      <img
        v-if="fromPhoto"
        :src="fromPhoto"
        width="84"
        height="84"
        :style="{ borderRadius: '42px', border: '4px solid #ffffff', objectFit: 'cover' }"
      />
      <div v-else :style="{ width: '84px', height: '84px', borderRadius: '42px', border: '4px solid #ffffff', backgroundColor: '#3A6091', display: 'flex' }" />
      <div :style="{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }">
        <div :style="{ display: 'flex', fontSize: '27px', fontWeight: 700, color: '#ffffff' }">{{ fromName }}さん</div>
        <div v-if="relationship" :style="{ display: 'flex', fontSize: '20px', color: '#C9D6E5', marginTop: '3px' }">{{ relationship }}</div>
      </div>

      <!-- 矢印（フォント非依存でCSS描画：線＋三角）。Noto Sans JPに→(U+2192)が無く豆腐になるため -->
      <div :style="{ display: 'flex', alignItems: 'center', marginLeft: '24px', marginRight: '24px' }">
        <div :style="{ width: '34px', height: '5px', backgroundColor: '#D4A857' }" />
        <div :style="{ width: '0px', height: '0px', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '17px solid #D4A857' }" />
      </div>

      <!-- to（宛先） -->
      <img
        v-if="toPhoto"
        :src="toPhoto"
        width="84"
        height="84"
        :style="{ borderRadius: '42px', border: '4px solid #ffffff', objectFit: 'cover' }"
      />
      <div v-else :style="{ width: '84px', height: '84px', borderRadius: '42px', border: '4px solid #ffffff', backgroundColor: '#3A6091', display: 'flex' }" />
      <div :style="{ display: 'flex', flexDirection: 'column', marginLeft: '16px' }">
        <div :style="{ display: 'flex', fontSize: '27px', fontWeight: 700, color: '#ffffff' }">{{ toName }}さん</div>
        <div :style="{ display: 'flex', fontSize: '20px', color: '#D4A857', marginTop: '3px' }">エピソードの宛先</div>
      </div>
    </div>

    <!-- 本文（引用） -->
    <div :style="{ display: 'flex', flex: 1, alignItems: 'center' }">
      <div :style="{ fontSize: '42px', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }">
        「{{ comment }}」
      </div>
    </div>
  </div>
</template>
