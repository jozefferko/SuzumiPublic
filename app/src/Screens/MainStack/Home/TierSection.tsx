import {Maybe} from 'purify-ts';
import React, {useMemo, useState} from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {useDispatch, useSelector} from 'react-redux';
import {getSushiSVG} from '../../../assets/svgs';
import {
    FSCachedTransaction,
    FSRestaurant,
    FSTier,
    FSUser,
} from '../../../common/types/firestore';
import {Dictionary} from '../../../common/types/misc';
import {
    daysUntilTimestamp,
    formatFSTimestamp,
} from '../../../common/utils/dateOperations';
import {trigger} from '../../../common/utils/fp';
import {Condition} from '../../../components/logicalLib';
import {useLocale} from '../../../hooks/useLocale';
import {RootState} from '../../../redux';
import {useSafeSelector} from '../../../redux/selectors';
import TierStatusModal from './TierStatusModal';

// const tiers: FSTier[] = [
//     {
//         color: theme.tierColors.bronze,
//         description: {en: 'e', dk: 'e'},
//         displayName: {en: 'bronze', dk: 'gold'},
//         expire: false,
//         points: 10,
//         maintainPoints: 0,
//     },
//     {
//         color: '#A0B4BE',
//         description: {en: 'e', dk: 'e'},
//         displayName: {en: 'silver', dk: 'gold'},
//         expire: false,
//         points: 10,
//         maintainPoints: 0,
//     },
//     {
//         color: '#E4A836',
//         description: {en: 'e', dk: 'e'},
//         displayName: {en: 'gold', dk: 'gold'},
//         expire: false,
//         points: 10,
//         maintainPoints: 0,
//     },
//     {
//         color: '#7AB0F0',
//         description: {en: 'e', dk: 'e'},
//         displayName: {en: 'platinum', dk: 'gold'},
//         expire: false,
//         points: 10,
//         maintainPoints: 0,
//     },
// ];

type props = {
    user: FSUser;
};

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export const sumRecentTransactions = (
    recentTransactions: Dictionary<FSCachedTransaction>,
) =>
    Object.values(recentTransactions)
        .map(($) => $.amount)
        .reduce((acc, val) => acc + val, 0);
const TierSection = (props: props) => {
    const {t} = useLocale();
    const tiers = useSelector(
        (state: RootState): FSTier[] => state.restaurant?.tiers.tiers ?? [],
    );
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state: RootState) => state.restaurant,
    );
    const currentTierIndex = props.user.tiers.currentTier;
    const [showModal, setShowModal] = useState<number | undefined>();
    const safeCurrentTier = Maybe.fromNullable(tiers[currentTierIndex]);
    {
        safeCurrentTier.mapOrDefault(($) => t($.displayName), '');
    }
    const accumulatedPoints = useMemo(
        () => sumRecentTransactions(props.user.recentPoints),
        [props.user],
    );
    const nextTier = useMemo(
        () => Maybe.fromNullable(tiers[currentTierIndex + 1]),
        [currentTierIndex, tiers],
    );

    return (
        <View style={styles.wrapper}>
            <Pressable
                style={{flexDirection: 'row', justifyContent: 'space-between'}}
                onPress={trigger(setShowModal)(currentTierIndex)}>
                <View
                    style={{
                        flexDirection: 'column',
                    }}>
                    <Text style={styles.tierStatusHeader}>
                        {t('Your tier status')}
                    </Text>
                    <View>
                        <Text
                            style={{
                                ...styles.currentTier,
                                color: safeCurrentTier.mapOrDefault(
                                    ($) => $.color,
                                    '#FFF',
                                ),
                            }}>
                            {'Suzumi '}
                            {safeCurrentTier.mapOrDefault(
                                ($) => capitalizeFirstLetter(t($.displayName)),
                                '',
                            )}{' '}
                            <AntDesignIcon name="right" size={18} />
                        </Text>
                    </View>
                </View>
                <SvgXml
                    xml={getSushiSVG(
                        safeCurrentTier.mapOrDefault(($) => $.color, '#FFF'),
                        true,
                    )}
                    height={70}
                    width={90}
                    preserveAspectRatio="xMidYMid meet"
                />
            </Pressable>
            <Condition if={props.user.tiers.expiry.expires}>
                <Condition if={props.user.tiers.expiry.amountToMaintain > 0}>
                    <View>
                        <Text style={styles.tierUntil}>
                            {t('Expires after {{days}} days', {
                                days: daysUntilTimestamp(
                                    props.user.tiers.expiry.end,
                                ),
                            })}
                        </Text>
                        <Text style={styles.amountToKeepTier}>
                            {t(
                                'Earn {{amountToMaintain}} points by {{expiryDate}} for another {{period}} of Suzumi {{tier}}.',
                                {
                                    amountToMaintain:
                                        props.user.tiers.expiry
                                            .amountToMaintain,
                                    expiryDate: formatFSTimestamp(
                                        props.user.tiers.expiry.end,
                                    ),
                                    period: safeRestaurant.extractNullable()
                                        ?.tiers.expiryPeriod,
                                    tier: safeCurrentTier.mapOrDefault(
                                        ($) =>
                                            capitalizeFirstLetter(
                                                t($.displayName),
                                            ),
                                        '',
                                    ),
                                },
                            )}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.tierUntil}>
                            {t('You maintained your tier!')}
                        </Text>
                        <Text style={styles.amountToKeepTier}>
                            {t('New qualification period will start {date}', {
                                date: formatFSTimestamp(
                                    props.user.tiers.expiry.end,
                                ),
                            })}
                        </Text>
                    </View>
                </Condition>
                <View>
                    <Text style={styles.tierUntil}>
                        {t('This tier does not expire')}
                    </Text>
                </View>
            </Condition>
            {nextTier.mapOrDefault(
                (nt) => (
                    <View>
                        <View style={styles.divider} />
                        <Text style={styles.tierStatusHeader}>
                            {t('Your tier progress')}
                        </Text>
                        <Text style={styles.cumPoints}>
                            {accumulatedPoints}/
                            <Text style={styles.cumPointGoal}>
                                {nt.points}
                                {' ' + t('points')}
                            </Text>
                        </Text>
                        <Text style={styles.cumPointsToEarn}>
                            {nt.points - accumulatedPoints}
                            {' ' + t('pts')}
                            <Text style={styles.untilNextTier}>
                                {t('until') + ' '}
                                {t(nt.displayName)}
                            </Text>
                        </Text>
                        <View style={styles.progressContainer}>
                            <View
                                style={{
                                    ...styles.progress,
                                    width: `${
                                        (accumulatedPoints / nt.points) * 100
                                    }%`,
                                }}
                            />
                        </View>
                    </View>
                ),
                null,
            )}

            <TouchableOpacity
                style={{flexDirection: 'row'}}
                onPress={trigger(setShowModal)(currentTierIndex)}>
                <Text style={styles.tierDetailsButton}>
                    {t('Tier details')}
                </Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TierStatusModal
                tiers={tiers}
                show={showModal}
                onClose={setShowModal}
                user={props.user}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'column',
    },
    tierStatusHeader: {
        color: '#999999',
        fontSize: 14,
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Medium',
        paddingBottom: 10,
    },
    currentTier: {
        color: '#999999',
        fontSize: 22,
        textTransform: 'capitalize',
        fontFamily: 'Roboto-Medium',
        paddingBottom: 30,
        paddingTop: 10,
    },
    tierUntil: {
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'Roboto-Regular',
    },
    amountToKeepTier: {
        color: '#999999',
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
    },

    cumPoints: {
        color: '#ffffff',
        fontSize: 40,
        fontFamily: 'Roboto-Medium',
        marginVertical: 5,
    },
    cumPointGoal: {
        color: '#999999',
        fontSize: 22,
        fontFamily: 'Roboto-Medium',
    },
    cumPointsToEarn: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
    },
    untilNextTier: {
        color: '#999999',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
    },
    tierDetailsButton: {
        marginTop: 18,
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: '#9698A1',
        borderColor: '#9698A1',
        borderWidth: 1,
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 15,
    },

    progressContainer: {
        width: '100%',
        flexDirection: 'column',
        height: 20,
        borderRadius: 50,
        marginTop: 12,
        backgroundColor: '#5F524B',
    },
    progress: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#FFAF47',
    },

    divider: {
        marginVertical: 25,

        height: 1,
        backgroundColor: '#373B4C',
    },
    //space
});

export default TierSection;
