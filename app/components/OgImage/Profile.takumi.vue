<script setup lang="ts">
withDefaults(defineProps<{
  name?: string
  headline?: string
  photo?: string
}>(), {
  name: 'ユーノーミー',
  headline: '',
  photo: '',
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
      padding: '56px 80px',
    }"
  >
    <!-- 湯呑み柄の背景 -->
    <img src="/og-bg.png" :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '630px' }" />

    <!-- 左上ロゴ（湯呑み＋ユーノーミー） -->
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <img src="/og-yunomi.png" width="42" height="55" />
      <div :style="{ marginLeft: '16px', fontSize: '34px', fontWeight: 700, color: '#ffffff' }">ユーノーミー</div>
    </div>

    <!-- メイン（写真＋テキスト） -->
    <div :style="{ display: 'flex', alignItems: 'center', flex: 1 }">
      <img
        v-if="photo"
        :src="photo"
        width="280"
        height="280"
        :style="{ borderRadius: '140px', border: '9px solid #ffffff', objectFit: 'cover' }"
      />
      <div :style="{ display: 'flex', flexDirection: 'column', marginLeft: photo ? '64px' : '0px', flex: 1 }">
        <div :style="{ fontSize: '68px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }">
          {{ name }}
        </div>
        <div
          v-if="headline"
          :style="{ fontSize: '36px', color: '#C9D6E5', marginTop: '16px' }"
        >
          {{ headline }}
        </div>
        <div :style="{ fontSize: '28px', fontWeight: 700, color: '#D4A857', marginTop: '28px' }">
          私のビジネスプロフィール
        </div>
      </div>
    </div>
  </div>
</template>
