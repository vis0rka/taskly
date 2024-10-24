import { StatusBar } from 'expo-status-bar';
import {
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  FlatList,
  LayoutAnimation,
} from 'react-native';
import { theme } from '../theme';
import { ShoppingListItem } from '../components/ShoppingListItem';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';
import * as Haptics from 'expo-haptics';

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

const storageKey = 'shopping-list';

export default function App() {
  const [value, setValue] = useState<string>();
  const [list, setList] = useState<ShoppingListItemType[]>([]);

  useEffect(() => {
    const getData = async () => {
      const data = await getFromStorage(storageKey);

      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setList(data);
      }
    };

    getData();
  }, []);

  const handleSubmit = () => {
    if (value) {
      const newList = [
        {
          id: new Date().toTimeString(),
          lastUpdatedTimestamp: Date.now(),
          name: value,
        },
        ...list,
      ];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setList(newList);
      saveToStorage(storageKey, newList);
      setValue('');
    }
  };

  const removeItem = (id: string) => {
    const newList = list.filter((item) => item.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setList(newList);
    saveToStorage(storageKey, newList);
  };

  const handleToggleComlete = (id: string) => {
    const newList = list.map((item) => {
      if (item.id === id) {
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return {
          ...item,
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : Date.now(),
          lastUpdatedTimestamp: Date.now(),
        };
      }

      return item;
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setList(newList);
    saveToStorage(storageKey, newList);
  };

  return (
    <FlatList
      data={orderShoppingList(list)}
      renderItem={({ item }) => {
        return (
          <ShoppingListItem
            name={item.name}
            removeItem={() => removeItem(item.id)}
            onToggleComplete={() => handleToggleComlete(item.id)}
            isCompleted={!!item.completedAtTimestamp}
          />
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>Your shopping list is empty!</Text>
        </View>
      }
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={
        <TextInput
          placeholder="e.g. coffee"
          style={styles.textInput}
          value={value}
          onChangeText={setValue}
          returnKeyType="done"
          onSubmitEditing={() => handleSubmit()}
        />
      }
    ></FlatList>
  );
}

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }

    return 0;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  contentContainer: {
    paddingTop: 24,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    backgroundColor: theme.colorWhite,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
