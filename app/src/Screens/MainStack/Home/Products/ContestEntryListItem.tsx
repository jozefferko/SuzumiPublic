import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {contestImage} from '../../../../assets/staticImages';
import theme from '../../../../assets/theme.style';
import {formatFSTimestamp} from '../../../../common/utils/dateOperations';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import {ContestEntry} from '../../../../redux/selectors';

type ContestEntryListItemProps = {
    item: ContestEntry;
};
export const activeDuration = 1;

const ContestEntryListItem = (props: ContestEntryListItemProps) => {
    const {t} = useLocale();
    return (
        <View style={styles.wrapper}>
            <FastImage source={contestImage} style={styles.productImage} />
            <View style={styles.labelBox}>
                <Text style={styles.title}>{t('Contest entries')}</Text>
                <Text style={styles.purchaseDate}>
                    {t('Contest ending {{date}}', {
                        date: formatFSTimestamp(props.item.endDate),
                    })}
                </Text>
                <Text style={styles.entries}>
                    {t('entriesCount', {
                        count: props.item.entries,
                    })}
                </Text>
            </View>
            <Condition if={props.item.expired}>
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
    entries: {
        alignSelf: 'center',
        paddingTop: 10,
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        color: theme.HIGHLIGHT,
    },
});

export default ContestEntryListItem;
