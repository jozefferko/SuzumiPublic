import React from 'react';
import {StyleProp, StyleSheet, Text, TouchableOpacity} from 'react-native';
import theme from '../assets/theme.style';

type props = {
    title: React.ReactNode;
    style?: StyleProp<any>;
    textStyle?: StyleProp<any>;
    onPress: () => any;
    outlined?: boolean;
    disabled?: boolean;
};
const ConfirmButton = (props: props) => {
    return (
        <TouchableOpacity
            disabled={props.disabled}
            style={{
                ...styles.fancyButton,
                ...(props.outlined ? styles.outlinedButton : {}),
                ...props.style,
            }}
            onPress={props.onPress}>
            <Text
                style={{
                    ...styles.text,
                    ...(props.outlined ? {color: theme.HIGHLIGHT} : {}),
                    ...props.textStyle,
                }}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    text: {
        color: '#fff',
        fontSize: 17,
        fontFamily: 'Roboto',
        textAlign: 'center',
        textAlignVertical: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
    fancyButton: {
        paddingVertical: 15,
        backgroundColor: theme.HIGHLIGHT,
        borderRadius: 50,
        paddingHorizontal: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
    outlinedButton: {
        backgroundColor: 'transparent',
        borderColor: theme.HIGHLIGHT,
        borderWidth: 1,
        textAlign: 'center',
        textAlignVertical: 'center',
        alignContent: 'center',
        justifyContent: 'center',
    },
});

export default ConfirmButton;
