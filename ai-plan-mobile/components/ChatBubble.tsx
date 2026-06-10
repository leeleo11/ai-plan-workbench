// ai-plan-mobile/components/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Personality } from '../lib/personality';

interface ChatBubbleProps {
  message: string;
  isAI: boolean;
  personality: Personality;
}

export function ChatBubble({ message, isAI, personality }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {isAI && (
        <View style={[styles.avatar, { backgroundColor: personality.backgroundColor }]}>
          <Text style={styles.avatarEmoji}>{personality.emoji}</Text>
        </View>
      )}
      <View style={[
        styles.bubble,
        isAI
          ? [styles.aiBubble, { backgroundColor: personality.backgroundColor, borderColor: personality.borderColor }]
          : styles.userBubble
      ]}>
        <Text style={[styles.message, isAI && { color: personality.color }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#E5E7EB',
    borderBottomRightRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
