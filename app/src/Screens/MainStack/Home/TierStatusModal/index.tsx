import {Maybe} from 'purify-ts';
import React, {useEffect, useRef, useState} from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {Static} from 'runtypes';
import theme from '../../../../assets/theme.style';
import {FSTier, FSUser} from '../../../../common/types/firestore';
import CustomModal from '../../../../components/CustomModal';
import {Condition} from '../../../../components/logicalLib';
import {useLocale} from '../../../../hooks/useLocale';
import TierStatus from './TierStatus';
import TierStepper from './TierStepper';
import _ from 'lodash/fp';

type props = {
    show: number | undefined;
    onClose: (index?: number) => any;
    tiers: FSTier[];
    user: Static<typeof FSUser>;
};

const TierStatusModal = (props: props) => {
    const {t} = useLocale();
    const [index, setIndex] = useState(0);
    // useEffect(() => trigger(setIndex)(props.startIndex ?? 0), [
    //     props.startIndex,
    // ]);
    useEffect(() => {
        Maybe.fromNullable(props.show).ifJust(setIndex);
    }, [props.show]);

    const currentTier = props.tiers[index];
    return (
        <CustomModal
            height={'75%'}
            show={Maybe.fromNullable(props.show).isJust()}
            onClose={props.onClose}>
            <Text style={styles.heading}>{t('The Suzumi tiers')}</Text>

            <TierStepper
                currentTier={index}
                tiers={props.tiers}
                onPress={props.onClose}
            />
            <ScrollView
                style={styles.card}
                contentContainerStyle={{
                    padding: 25,
                }}>
                <TouchableWithoutFeedback>
                    <View>
                        <Text style={styles.tierName}>
                            Suzumi {t(currentTier?.displayName ?? '')}
                        </Text>
                        <Condition if={props.user.tiers.currentTier === index}>
                            <TierStatus user={props.user} />
                            <></>
                        </Condition>
                        <Text style={styles.tierDescription}>
                            {t(currentTier?.description ?? '')}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </CustomModal>
    );
};

const triangleSize = 20;
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        width: '100%',
        flex: 1,
        // maxHeight: '60%',
    },
    content: {
        // backgroundColor: '#F0F',
        width: '100%',
        // flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 30,
        fontFamily: 'Roboto-Medium',
        paddingBottom: 30,
    },

    tierName: {
        color: theme.BACKGROUND_COLOR,
        fontSize: 30,
        fontFamily: 'Roboto-Medium',
        paddingBottom: 25,
    },

    tierDescription: {
        color: theme.BACKGROUND_COLOR,
        fontSize: 15,
        fontFamily: 'Roboto-Regular',
    },
    //space
});

export default TierStatusModal;
