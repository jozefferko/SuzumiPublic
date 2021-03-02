import {Maybe} from 'purify-ts';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import Slider from 'react-native-slide-to-unlock';
import {useDispatch} from 'react-redux';
import {defaultImage} from '../../../../assets/staticImages';
import theme from '../../../../assets/theme.style';
import {FSPathMap} from '../../../../common/types/firestore';
import {
    formatFSTimestamp,
    secondsSinceFSTimestamp,
} from '../../../../common/utils/dateOperations';
import {fsRunTransaction} from '../../../../common/utils/firestore/fsTransaction';
import {serverTimestamp} from '../../../../common/utils/firestore/normalize';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {pingPurchases} from '../../../../redux/purchasesSlice';
import {Purchase} from '../../../../redux/selectors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ConfirmButton from '../../../../components/ConfirmButton';

type ProductsListProps = {
    item: Purchase;
    scrollSetter: (a: boolean) => void;
    onPress: (a: Purchase) => any;
};
export const activeDuration = 1;

const formatSeconds = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${seconds % 60}`;

const ClaimedListItem = (props: ProductsListProps) => {
    const d = useDispatch();
    const {item} = props;
    const product = props.item.productData;
    const {t} = useLocale();

    const [secondsLeft, setSecondsLeft] = useState(0);
    useEffect(() => {
        if (item.activated && !item.expired) {
            const secTimer = setInterval(() => {
                const timeLeft = item.activated
                    ? activeDuration * 60 -
                      secondsSinceFSTimestamp(item.activated)
                    : 0;
                timeLeft > 0 && !item.expired
                    ? setSecondsLeft(timeLeft)
                    : d(pingPurchases());
            }, 200);

            return () => clearInterval(secTimer);
        }
    }, [d, item.expired, item.activated]);

    // const activate = () =>
    //     fsRunTransaction((transaction) =>
    //         transaction
    //             .get(FSPathMap.purchases.doc(props.item.id))
    //             .run()
    //             .then((safePurchase) =>
    //                 safePurchase
    //                     .chain(Maybe.fromPredicate(($) => !$.activated))
    //                     .map((purchase) =>
    //                         transaction.update(
    //                             FSPathMap.purchases.doc(purchase.id),
    //                         )({activated: serverTimestamp()}),
    //                     )
    //                     .map(() => true),
    //             ),
    //     );

    return (
        <View style={styles.wrapper}>
            <FastImage
                source={product.imgUrl ? {uri: product.imgUrl} : defaultImage}
                style={styles.productImage}
            />
            <View style={styles.labelBox}>
                <Text style={styles.title}>{t(product.displayName)}</Text>
                <Text style={styles.purchaseDate}>
                    {t('Purchased {{date}}', {
                        date: formatFSTimestamp(props.item.purchased),
                    })}
                </Text>
                <Text style={styles.description}>
                    {t(product.claimedDescription)}
                </Text>
                <Condition if={item.expired}>
                    <Text
                        style={{
                            alignSelf: 'center',
                            fontSize: 16,
                            fontFamily: 'Roboto-Light',
                            color: theme.BACKGROUND_COLOR,
                        }}>
                        {Maybe.fromNullable(item.activated).mapOrDefault(
                            (d) => formatFSTimestamp(d, true),
                            '',
                        )}
                    </Text>
                    {item.activated ? (
                        <View style={styles.activatedBox}>
                            <Text style={styles.activatedLabel}>
                                {formatFSTimestamp(item.activated)}
                            </Text>
                            <Text style={styles.activatedLabel}>
                                {t('Valid for {{period}} min', {
                                    period: formatSeconds(secondsLeft),
                                })}
                            </Text>
                        </View>
                    ) : (
                        <ConfirmButton
                            title={t('Activate')}
                            onPress={() => props.onPress(item)}
                        />
                    )}
                </Condition>
            </View>
            <Condition if={item.expired}>
                <View style={styles.expiredOverlay} />
                <></>
            </Condition>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        borderRadius: 5,
    },
    title: {
        fontSize: 17,
        fontFamily: 'Roboto-Medium',
        color: theme.BACKGROUND_COLOR,
    },
    sliderText: {
        fontSize: 17,
        fontFamily: 'Roboto-Regular',
        color: '#FFFFFF',
    },
    productImage: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        resizeMode: 'cover',
    },
    purchaseDate: {
        marginBottom: 23,
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    description: {
        marginTop: 12,
        marginBottom: 23,
        fontSize: 13,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    labelBox: {
        padding: 30,
    },
    activatedBox: {
        flexDirection: 'row',
        backgroundColor: '#74D658',
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    activatedLabel: {
        fontSize: 17,
        fontFamily: 'Roboto-Regular',
        color: '#FFFFFF',
    },
    expiredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(50,50,50,0.65)',
    },
});

export default ClaimedListItem;
