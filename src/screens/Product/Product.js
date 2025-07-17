import { View, Text, StyleSheet, TouchableOpacity, Image, Button, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { OPENAI_API_KEY } from '../../utils/config';


export default function Product() {

    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('')
    const [desctiption, setDescription] = useState('')
    const [loader, setLoader] = useState(false)

    const handleTakePhoto = () => {
        const options = {
            mediaType: 'photo', // 'photo' or 'video'
            includeBase64: true,
        };

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera picker');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response);
            } else {
                setImage(response.assets[0]);
                const base64 = `data:${response.assets[0].type};base64,${response.assets[0].base64}`
                setLoader(true)
                setTitle('')
                setDescription('')
                createImageDes(base64)
            }
        });
    };

    const createImageDes = async (value) => {

        const userMessage = {
            role: 'user', content: [
                // { type: "text", text: "Describe this product for my ecommerce site." },
                { type: "text", text: "Look at this product image and generate a JSON object like:\n1. A short, clear, and attractive title describing the product.\n2. A detailed description of the product, covering its main features, design, function, materials, performance, purpose, and possible uses. Write it in a professional, informative, and clear tone, suitable for general audiences, without assuming it is only for e-commerce." },
                { type: "image_url", image_url: { url: value } },
            ]
        };
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    // model: 'gpt-3.5-turbo',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    max_tokens: 800,
                    messages: [userMessage],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                }
            );
            const botMessage = response.data.choices[0]?.message?.content;
            const cleanedText = botMessage.replace(/```json|```/g, '').replace(/[\u0000-\u001F]+/g, ' ').trim();
            const final = JSON.parse(cleanedText)
            setTitle(final?.title)
            setDescription(final?.description)

        } catch (error) {
            console.error('OpenAI API error:', error);
            const errorMessage = {
                role: 'assistant',
                content: '❌ Error: Failed to get response.',
            };
            setTitle('')
            setDescription('')
            // setMessages([...updatedMessages, errorMessage]);
        } finally {
            setLoader(false);
        }
    }

    return (
        <View>
            <View style={styles.uploadContent}>
                <TouchableOpacity style={styles.uploadImageBtn} onPress={() => handleTakePhoto()}>
                    {image && <Image source={{ uri: image?.uri }} style={styles.uploadImg} />}
                    <Image source={require('../../assets/plus.png')} />
                </TouchableOpacity>
                {loader &&
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="green" />
                    </View>
                }
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.des}>{desctiption}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    uploadContent: {
        marginTop: 5,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
    },

    uploadImageBtn: {
        backgroundColor: '#c2bebc',
        borderRadius: 5,
        width: 140,
        height: 140,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadImg: {
        width: 140,
        height: 140,
        position: 'absolute'
    },
    title: {
        margin: 20,
        fontSize: 18,
        fontWeight: '500',
        color: '#6b5629',
        textAlign: 'center'
    },
    des: {
        margin: 20,
        fontSize: 14,
        fontWeight: '400',
        color: '#8a7954'
    },
    loader: {
        // backgroundColor: 'red',
        marginTop: 10
    }

})