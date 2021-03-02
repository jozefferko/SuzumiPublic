import React from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeState} from '../../../../hooks/useSafeState';
import {
    contestProductSelector,
    orderedProductsSelector,
    Product,
} from '../../../../redux/selectors';
import ConfirmPurchase from './ConfirmPurchase';
import ProductsListItem from './ProductsListItem';
import ContestItem from './ContestItem';
import {Condition} from '../../../../components/logicalLib';
import {RootState} from '../../../../redux';

const ProductsList = () => {
    const {t} = useLocale();
    const products = useSelector(orderedProductsSelector());
    const contestProduct = useSelector(contestProductSelector());

    const [popUp, setPopUp] = useSafeState<Product>();
    const renderer: ListRenderItem<Product> = ({item, index}) => (
        <>
            {contestProduct
                .filter(($) => index === 0)
                .mapOrDefault(
                    ($) => (
                        <>
                            <ContestItem product={$} />
                            <Separator />
                        </>
                    ),
                    null,
                )}
            <ProductsListItem item={item} onPress={setPopUp} />
        </>
    );

    return (
        <View style={styles.wrapper}>
            <FlatList
                ItemSeparatorComponent={Separator}
                style={styles.list}
                renderItem={renderer}
                data={products}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{paddingVertical: 30}}
                // columnWrapperStyle={styles.gridRow}
            />
            <ConfirmPurchase onClose={() => setPopUp()} data={popUp} />
        </View>
    );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    list: {
        // flex: 1,
        paddingHorizontal: theme.padding,
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
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
        marginVertical: 30,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default ProductsList;
