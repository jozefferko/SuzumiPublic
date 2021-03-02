import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import {defaultImage} from '../../../assets/staticImages';
import {useLocale} from '../../../hooks/useLocale';
import {openLinkInApp} from '../../../utils/link';
import {FSOffer} from '../../../common/types/firestore';

type props = {
    item: FSOffer;
};
const Article = (props: props) => {
    const {item} = props;
    const {t} = useLocale();
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            onPress={() =>
                item.type === 'link'
                    ? openLinkInApp(item.url)
                    : navigation.navigate('inAppArticle', {offer: item})
            }
            style={styles.wrapper}>
            <FastImage
                source={item.imgUrl ? {uri: item.imgUrl} : defaultImage}
                style={styles.productImage}
            />
            <View
                style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                <Text style={styles.title}>{t(item.displayName)}</Text>
            </View>
            <View style={{flex: 1}} />
            <SimpleLineIcon
                style={styles.icon}
                name="arrow-right"
                size={16}
                color="#A1A1A1"
            />
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'row',
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Regular',
        color: '#FFF',
    },
    productImage: {
        marginRight: 25,
        width: 90,
        height: 90,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    expiration: {
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: '#999999',
    },
    icon: {
        alignSelf: 'center',
    },
});

export default Article;
