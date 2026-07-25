import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyCPuL2t4Bj-c39nz-8iutgPvM01jnHz4ow',
  authDomain: 'u-no-11938.firebaseapp.com',
  projectId: 'u-no-11938',
  storageBucket: 'u-no-11938.firebasestorage.app',
  messagingSenderId: '78284896839',
  appId: '1:78284896839:web:f7aa2adcfac5fec08b4f62',
}

// Firebaseアプリの初期化のみを行う。
// 以前はここで getFirestore()/getAuth() を呼んで $firestore/$auth を provide していたが、
//  1) これらの provide はどこからも参照されていない（各composableがクライアントで
//     getAuth()/getFirestore() を直接呼ぶ）デッドコードだった
//  2) firestore系を import しないページ（例: エピソード単体ページ）のSSRチャンクでは
//     firebase/firestore の登録副作用が tree-shake され、getFirestore() が
//     "Service firestore is not available" で500になる
// ため、インスタンス取得は行わず初期化だけに留める。
export default defineNuxtPlugin(() => {
  if (getApps().length === 0) initializeApp(firebaseConfig)
})
