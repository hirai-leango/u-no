import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCPuL2t4Bj-c39nz-8iutgPvM01jnHz4ow',
  authDomain: 'u-no-11938.firebaseapp.com',
  projectId: 'u-no-11938',
  storageBucket: 'u-no-11938.firebasestorage.app',
  messagingSenderId: '78284896839',
  appId: '1:78284896839:web:f7aa2adcfac5fec08b4f62',
}

export default defineNuxtPlugin(() => {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  return {
    provide: {
      firestore: getFirestore(app),
      auth: getAuth(app),
    },
  }
})
