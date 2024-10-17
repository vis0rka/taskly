import { StatusBar } from 'expo-status-bar';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { theme } from './theme';

export default function App() {
  const handleDelete = () => {
    Alert.alert(
      'Are you sure you want to delete this?',
      'it will be gone for good?',
      [
        {
          text: 'Yes',
          onPress: () => console.log('Oke deleting.'),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <Text style={{ fontSize: 18, fontWeight: 500 }}>Coffee</Text>

        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  itemContainer: {
    borderBottomColor: 'red',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
