import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { advisorStyles, pets, type AdvisorStyleId, type PetId } from '../lib/planIntake';

interface ChatBubbleProps {
  message: string;
  isAI: boolean;
  advisorStyle: AdvisorStyleId;
  petId?: PetId;
}

export function ChatBubble({ message, isAI, advisorStyle, petId = 'fox' }: ChatBubbleProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const style = advisorStyles[advisorStyle];
  const pet = pets[petId];

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [fade]);

  return (
    <Animated.View style={[styles.row, isAI ? styles.aiRow : styles.userRow, { opacity: fade }]}>
      {isAI && (
        <View style={[styles.avatar, { backgroundColor: pet.light, borderColor: pet.border }]}>
          <Text style={styles.avatarEmoji}>{pet.emoji}</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isAI ? { backgroundColor: style.light, borderColor: style.border } : styles.userBubble,
        ]}
      >
        <Text style={[styles.message, isAI ? { color: '#1E2A24' } : styles.userText]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userBubble: {
    backgroundColor: '#24352F',
    borderColor: '#24352F',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF8EA',
  },
});
