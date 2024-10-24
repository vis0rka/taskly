import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import {
  CountdownStatus,
  countdownStorageKey,
  PersistedCountdownState,
} from '.';
import { getFromStorage } from '../../utils/storage';
import { format } from 'date-fns';
import { theme } from '../../theme';

const fullDateFormat = `LLL d yyyy, h:mm aaa`;

export default function HistoryScreen() {
  const [state, setState] = useState<PersistedCountdownState>();

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);

      if (value) {
        setState(value);
      }
    };

    init();
  }, []);

  return (
    <FlatList
      style={styles.list}
      data={state?.completedAtTimestamps}
      renderItem={({ item }) => {
        return (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>
              {format(item, fullDateFormat)}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    marginTop: 8,
  },
  listEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
  },
  listItem: {
    marginHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: theme.colorLightGrey,
    padding: 12,
    borderRadius: 6,
  },
  text: {
    fontSize: 24,
  },
  listItemText: {
    fontSize: 18,
  },
});
