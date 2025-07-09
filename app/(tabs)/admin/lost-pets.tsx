import { useNavigation } from 'expo-router';
import LostPetsScreen from '../../../src/screens/LostPetsScreen';

export default function AdminLostPets() {
  const navigation = useNavigation();
  return <LostPetsScreen navigation={navigation} />;
}
