import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicon from 'react-native-vector-icons/Octicons';
import theme from '../../../assets/theme.style';
import {Condition} from '../../../components/logicalLib';

type CardProps = {
    label: string;
    description?: string;
    badge?: boolean;
    onPress: () => any;
    children: React.ReactElement;
};

const Card = (props: CardProps) => {
    return (
        <TouchableOpacity onPress={props.onPress} style={styles.card}>
            <View style={styles.labelBox}>
                <Text style={styles.label}>
                    {props.label}
                    {'  '}
                    <Condition if={props.badge}>
                        <Octicon
                            // style={styles.icon}
                            name="primitive-dot"
                            size={12}
                            color={theme.NOTIFICATION_COLOR}
                        />
                        <></>
                    </Condition>
                </Text>
                <Text style={styles.description}>{props.description}</Text>
                <View style={{flex: 1}} />
                <Icon name="arrow-right" size={22} color="#A1A1A1" />
            </View>
            {props.children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        height: 150,
        borderRadius: 5,
        backgroundColor: '#1C1F2A',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 25,
    },
    labelBox: {
        paddingLeft: 15,
        paddingVertical: 10,
        flexDirection: 'column',
        height: '100%',
    },
    label: {
        color: '#FFFFFF',
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
    },
    description: {
        color: '#FFFFFF',
        fontFamily: 'Roboto-Light',
        fontSize: 12,
    },

    arrow: {},
});

export default Card;
