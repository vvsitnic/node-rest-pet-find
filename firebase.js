import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyD3QL5S7m6MdTjBwYYcar7o3STbfg2wP6s',
	authDomain: 'pet-find-database.firebaseapp.com',
	projectId: 'pet-find-database',
	storageBucket: 'pet-find-database.appspot.com',
	messagingSenderId: '851332366760',
	appId: '1:851332366760:web:d5b31c45f0a95541e71d9d',
	measurementId: 'G-SS1ZZXF0YH',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
