import React from 'react';
import {StyleProp, StyleSheet, Text, TouchableOpacity} from 'react-native';

type props = {
    title: string;
    style?: StyleProp<any>;
    onPress: () => any;
};
const FancyButton = (props: props) => {
    return (
        <TouchableOpacity
            style={{
                ...styles.fancyButton,
                ...(props.style ? props.style : {}),
            }}
            onPress={props.onPress}>
            <Text style={styles.text}>{props.title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
    fancyButton: {
        height: 40,
        backgroundColor: '#ec564f',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
});

export default FancyButton;
