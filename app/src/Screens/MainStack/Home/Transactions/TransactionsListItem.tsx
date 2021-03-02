import _ from 'lodash/fp';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {Static} from 'runtypes';
import {
    FSTransaction,
    FSTransactionType,
} from '../../../../common/types/firestore';
import {formatFSTimestamp} from '../../../../common/utils/dateOperations';
import {useLocale} from '../../../../hooks/useLocale';

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Regular',
        color: '#FFF',
    },
    date: {
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: '#999999',
    },
    icon: {
        marginRight: 20,
        alignSelf: 'center',
    },
});
const getIcon = _.cond<FSTransactionType, JSX.Element>([
    [
        _.equals('order'),
        _.always(
            <MaterialIcon
                style={styles.icon}
                name="restaurant"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.equals('purchase'),
        _.always(
            <AntDesignIcon
                style={styles.icon}
                name="gift"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.equals('expiry'),
        _.always(
            <FontAwesomeIcon
                style={styles.icon}
                name="exchange-alt"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.equals('referral'),
        _.always(
            <Icon
                style={styles.icon}
                name="trophy-award"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.equals('achievement'),
        _.always(
            <FontAwesomeIcon
                style={styles.icon}
                name="award"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.equals('correction'),
        _.always(
            <FontAwesomeIcon
                style={styles.icon}
                name="exchange-alt"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
    [
        _.stubTrue,
        _.always(
            <FontAwesomeIcon
                style={styles.icon}
                name="exchange-alt"
                size={25}
                color="#FFFFFF"
            />,
        ),
    ],
]);

type props = {
    item: Static<typeof FSTransaction>;
};
const TransactionsListItem = (props: props) => {
    const {item} = props;
    const {t} = useLocale();
    return (
        <View style={styles.wrapper}>
            {getIcon(item.type)}

            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginRight: 10,
                }}>
                <Text style={styles.title}>{t(item.plainRef)}</Text>
                <Text style={styles.date}>
                    {t('On ') + formatFSTimestamp(item.timestamp)}
                </Text>
            </View>
            <Text style={styles.title}>
                {(item.amount < 0 ? '- ' : '+ ') +
                    Math.abs(item.amount).toString() +
                    t(' pts')}
            </Text>
        </View>
    );
};

export default TransactionsListItem;
