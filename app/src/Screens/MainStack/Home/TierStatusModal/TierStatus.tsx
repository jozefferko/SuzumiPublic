import {Maybe} from 'purify-ts';
import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../../../assets/theme.style';
import {FSRestaurant, FSTier, FSUser} from '../../../../common/types/firestore';
import {formatFSTimestamp} from '../../../../common/utils/dateOperations';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {RootState} from '../../../../redux';
import {useSafeSelector} from '../../../../redux/selectors';
import {sumRecentTransactions} from '../TierSection';

type props = {
    user: FSUser;
};

const TierStatus = (props: props) => {
    const {t} = useLocale();
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state: RootState) => state.restaurant,
    );
    const tiers = useSelector(
        (state: RootState): FSTier[] => state.restaurant?.tiers.tiers ?? [],
    );
    const currentTierIndex = props.user.tiers.currentTier;
    const [showModal, setShowModal] = useState<number | undefined>();
    const safeCurrentTier = Maybe.fromNullable(tiers[currentTierIndex]);
    const progressBarWidth = 20;
    // {
    //     safeCurrentTier.mapOrDefault(($) => t($.displayName), '');
    // }
    const accumulatedPoints = useMemo(
        () => sumRecentTransactions(props.user.recentPoints),
        [props.user],
    );
    const nextTier = useMemo(
        () => Maybe.fromNullable(tiers[currentTierIndex + 1]),
        [currentTierIndex, tiers],
    );
    return (
        <View style={styles.container}>
            <Condition
                if={
                    !props.user.tiers.expiry.expires &&
                    props.user.tiers.expiry.amountToMaintain > 0
                }>
                <Text style={styles.expiryDescription}>
                    {t('Earn ')}
                    <Text
                        style={{
                            fontFamily: 'Roboto-Medium',
                        }}>
                        {props.user.tiers.expiry.amountToMaintain}
                    </Text>
                    {t(
                        ' points by {{expiryDate}} \nto maintain {{tier}} for another {{period}} months.',
                        {
                            expiryDate: formatFSTimestamp(
                                props.user.tiers.expiry.end,
                            ),
                            period: safeRestaurant.mapOrDefault(
                                ($) => $.tiers.expiryPeriod,
                                0,
                            ),
                            tier: safeCurrentTier.mapOrDefault(
                                ($) => t($.displayName),
                                '',
                            ),
                        },
                    )}
                </Text>
                <></>
            </Condition>
            {nextTier.mapOrDefault(
                (nt) => (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={{
                                    ...styles.progressBar,
                                    width: `${
                                        (accumulatedPoints / nt.points) * 100
                                    }%`,
                                }}
                            />
                        </View>
                        <Text style={styles.progress}>
                            {' '}
                            {accumulatedPoints} / {nt.points} {t('points')}
                        </Text>
                    </View>
                ),
                null,
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 30,
        // backgroundColor: '#F0F',
    },
    expiryDescription: {
        color: theme.BACKGROUND_COLOR,
        fontSize: 15,
        fontFamily: 'Roboto-Light',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        flexWrap: 'wrap',
    },
    progressBarContainer: {
        minWidth: 100,
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        height: 15,
        borderRadius: 20,
        backgroundColor: '#F2E2CE',
        marginRight: 10,
    },
    progressBar: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#E4A655',
    },
    progress: {
        color: theme.BACKGROUND_COLOR,
        fontSize: 13,
        fontFamily: 'Roboto-Light',
    },
});

export default TierStatus;
