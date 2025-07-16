import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native'
import React, { useState } from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { OPENAI_API_KEY } from '../../utils/config';


export default function Product() {

    const [image, setImage] = useState(null);

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
                // warningMassage('This app needs access to your camera')
            } else {
                // console.log(response.assets[0].base64)
                setImage(response.assets[0]);
                const base64 = `data:${response.assets[0].type};base64,${response.assets[0].base64}`
                createImageDes(base64)
            }
        });
    };

    const createImageDes = async (value) => {

        // const base64 = `data:image/jpeg;base64,${value}`
        console.log(value)

        const userMessage = {
            role: 'user', content: [
                // { type: "text", text: "Describe this product for my ecommerce site." },
                { type: "text", text: "Look at this product image and generate:\n1. A short and attractive product title.\n2. A detailed product description for an e-commerce website, highlighting its key features, design, and possible uses. Write it in a professional and persuasive tone." },
                { type: "image_url", image_url: {url: value}},
            ]
        };
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    // model: 'gpt-3.5-turbo',
                    model: 'gpt-4o',
                    temperature: 0.7,
                    messages: [userMessage],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                }
            );

            const botMessage = response.data.choices[0];
            console.log(botMessage)
            // setMessages([...updatedMessages, botMessage]);
        } catch (error) {
            console.error('OpenAI API error:', error);
            const errorMessage = {
                role: 'assistant',
                content: '❌ Error: Failed to get response.',
            };
            // setMessages([...updatedMessages, errorMessage]);
        } finally {
            // setLoading(false);
        }
    }

    return (
        <View>
            <View style={styles.uploadContent}>
                <TouchableOpacity style={styles.uploadImageBtn} onPress={() => handleTakePhoto()}>
                    {image && <Image source={{ uri: image?.uri }} style={styles.uploadImg} />}
                    <Image source={require('../../assets/plus.png')} />
                </TouchableOpacity>
                <Text style={styles.title}>Hollyland LARK M2 Wireless Microphone System bbvb vbvbnv vbvbnb</Text>
                <Text style={styles.des}>Experience crystal-clear audio with the Hollyland LARK M2, the ultimate wireless microphone system designed for creators, vloggers, interviewers, and content professionals. Compact, stylish, and packed with cutting-edge technology, the LARK M2 ensures your voice is captured with precision — anytime, anywhere.</Text>
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
    }

})