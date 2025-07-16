import {
    SafeAreaView,
    TextInput,
    Button,
    FlatList,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { OPENAI_API_KEY } from '../../utils/config';

export default function Home() {

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: updatedMessages,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                }
            );

            const botMessage = response.data.choices[0].message;
            setMessages([...updatedMessages, botMessage]);
        } catch (error) {
            console.error('OpenAI API error:', error);
            const errorMessage = {
                role: 'assistant',
                content: '❌ Error: Failed to get response.',
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={item.role === 'user' ? styles.userBubble : styles.botBubble}>
            <Text>{item.content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.chatContainer}
                />
                {loading && <ActivityIndicator size="small" color="#333" />}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type your message..."
                        multiline
                    />
                    <Button title="Send" onPress={sendMessage} disabled={loading} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    chatContainer: { padding: 10 },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#daf8cb',
        padding: 10,
        borderRadius: 10,
        marginVertical: 4,
        maxWidth: '80%',
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        marginVertical: 4,
        maxWidth: '80%',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
    },
});