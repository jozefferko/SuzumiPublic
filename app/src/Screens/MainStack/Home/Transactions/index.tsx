import React, {useMemo} from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Static} from 'runtypes';
import theme from '../../../../assets/theme.style';
import {FSTransaction} from '../../../../common/types/firestore';
import {useLocale} from '../../../../hooks/useLocale';
import {RootState} from '../../../../redux';
import TransactionsListItem from './TransactionsListItem';

const Transactions = () => {
    const {t} = useLocale();
    const transactions = useSelector((state: RootState) => state.transactions);
    const transactionsArray = useMemo<Static<typeof FSTransaction>[]>(
        () => (transactions ? Object.values(transactions) : []),
        [transactions],
    );

    const renderItem: ListRenderItem<Static<typeof FSTransaction>> = ({
        item,
    }) => <TransactionsListItem item={item} />;
    return (
        <>
            <Separator />
            <FlatList
                ItemSeparatorComponent={Separator}
                style={styles.list}
                renderItem={renderItem}
                data={transactionsArray}
                keyExtractor={(item) => item.id}
                // columnWrapperStyle={styles.gridRow}
            />
        </>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    list: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
        padding: theme.padding,
        // paddingTop: 50,
    },
    header: {
        marginVertical: 40,
        color: '#ffffff',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
    },
    wrapper: {
        backgroundColor: theme.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
        padding: theme.padding,
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default Transactions;
