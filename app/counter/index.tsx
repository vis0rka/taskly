import { useRouter } from 'expo-router';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';
import { registerForPushNotificationsAsync } from '../../utils/registerForPushNotificationsAsync';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Duration, isBefore, intervalToDuration } from 'date-fns';
import { TimeSegment } from '../../components/TImeSegment';
import { getFromStorage, saveToStorage } from '../../utils/storage';

export type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

export const countdownStorageKey = 'taskly-countdown';

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
};

//10 seconds from now
const frequency = 10 * 1000;

export default function CounterScreen() {
  const [countdownState, setCountDownState] =
    useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });
  const [isLoading, setLoading] = useState(true);

  const lastCompletedTimeStamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);

      if (value) {
        setCountDownState(value);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = lastCompletedTimeStamp
        ? lastCompletedTimeStamp + frequency
        : Date.now();
      if (lastCompletedTimeStamp) {
        setLoading(false);
      }
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : {
              start: Date.now(),
              end: timestamp,
            }
      );

      setStatus({ isOverdue, distance });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCompletedTimeStamp]);

  const scheduleNoti = async () => {
    let pushNotiId;

    const result = await registerForPushNotificationsAsync();

    if (result === 'granted') {
      pushNotiId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'The thing is due!',
        },
        trigger: {
          seconds: frequency / 1000,
        },
      });
    } else {
      if (Device.isDevice) {
        Alert.alert(
          'Unable to schedule notification',
          'Enable the noti permission for EXPO GO in settings'
        );
      }
    }
    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        countdownState?.currentNotificationId
      );
    }

    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotiId,
      completedAtTimestamps: countdownState
        ? [Date.now(), ...countdownState.completedAtTimestamps]
        : [Date.now()],
    };
    setCountDownState(newCountdownState);
    await saveToStorage(countdownStorageKey, newCountdownState);
  };

  if (isLoading) {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        status.isOverdue ? styles.containerLate : undefined,
      ]}
    >
      <Text style={styles.heading}>
        {status.isOverdue ? 'Thing overdue by' : 'Thind due in...'}
      </Text>
      <View style={styles.row}>
        <TimeSegment unit="Days" number={status.distance.days ?? 0} />
        <TimeSegment unit="Hours" number={status.distance.hours ?? 0} />
        <TimeSegment unit="Minutes" number={status.distance.minutes ?? 0} />
        <TimeSegment unit="Seconds" number={status.distance.seconds ?? 0} />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNoti}
      >
        <Text style={styles.buttonText}>I've done the thing!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  containerLate: {
    backgroundColor: 'red',
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  indicator: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
