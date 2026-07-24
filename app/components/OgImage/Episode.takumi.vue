<script setup lang="ts">
withDefaults(defineProps<{
  comment?: string
  fromName?: string
  fromPhoto?: string
  toName?: string
  relationship?: string
}>(), {
  comment: '',
  fromName: '',
  fromPhoto: '',
  toName: '',
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
      padding: '52px 80px',
    }"
  >
    <!-- 湯呑み柄の背景 -->
    <img src="/og-bg.png" :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '630px' }" />

    <!-- 左上ロゴ -->
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <img src="/og-yunomi.png" width="38" height="50" />
      <div :style="{ marginLeft: '14px', fontSize: '30px', fontWeight: 700, color: '#ffffff' }">ユーノーミー</div>
    </div>

    <!-- 宛先ラベル -->
    <div :style="{ fontSize: '26px', fontWeight: 700, color: '#D4A857', marginTop: '30px', display: 'flex' }">
      {{ toName }}さんへのエピソード
    </div>

    <!-- 本文（引用） -->
    <div :style="{ display: 'flex', flex: 1, alignItems: 'center' }">
      <div :style="{ fontSize: '46px', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }">
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
      <div :style="{ display: 'flex', flexDirection: 'column', marginLeft: fromPhoto ? '22px' : '0px' }">
        <div :style="{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }">{{ fromName }} さんより</div>
        <div v-if="relationship" :style="{ fontSize: '23px', color: '#C9D6E5', marginTop: '4px' }">{{ relationship }}</div>
      </div>
    </div>
  </div>
</template>
