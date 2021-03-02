import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import theme from '../../../../assets/theme.style';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeSelector} from '../../../../redux/selectors';
import {loadedState, UserStatus} from '../../../../redux/userSlice';
import {
    FSFeedbackQuestion,
    FSLocaleString,
    FSPathMap,
    FSRestaurant,
} from '../../../../common/types/firestore';
import _ from 'lodash/fp';
import {fFilter, fMap, trigger} from '../../../../common/utils/fp';
import FeedbackQuestion, {FeedbackQuestionProps} from './FeedbackQuestion';
import CommentPopUp from './CommentPopUp';
import {Maybe} from 'purify-ts/Maybe';
import ConfirmButton from '../../../../components/ConfirmButton';
import {
    fsUpload,
    fsUploadType,
} from '../../../../common/utils/firestore/queries';
import {Condition} from '../../../../components/logicalLib';
import {useNavigation} from '@react-navigation/native';
import {serverTimestamp} from '../../../../common/utils/firestore/normalize';
import {useDispatch} from 'react-redux';
import {setSettings} from '../../../../redux/settingsSlice';

const questionEnabledPredicate = (question: FSFeedbackQuestion) =>
    question.active;
const Feedback = () => {
    const navigation = useNavigation();
    const d = useDispatch();
    const {t} = useLocale();
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state) => state.restaurant,
    );
    const [comment, setComment] = useState('');
    const [showPopUp, setShowPopUp] = useState(false);
    const [answers, setAnswers] = useState<{[i: number]: boolean}>({});
    const setAnswer = useCallback(
        (index: number) => (value: boolean) =>
            setAnswers(($) => ({...$, [index]: value})),
        [],
    );
    const questionData = useCallback(
        (val: FSLocaleString, i: number): FeedbackQuestionProps => ({
            setValue: setAnswer(i),
            value: Maybe.fromNullable(answers[i]),
            label: val,
        }),
        [setAnswer, answers],
    );
    const filteredQestions: FeedbackQuestionProps[] = useMemo(
        () =>
            safeRestaurant
                .map(
                    _.flow(
                        ($) => $.feedback.questions,
                        fFilter(questionEnabledPredicate),
                        fMap(($) => $.displayName),
                        fMap(questionData),
                    ),
                )
                .orDefault([]),
        [questionData, safeRestaurant],
    );
    const closePopUp = (val?: string) => {
        Maybe.fromNullable(val).ifJust(setComment);
        setShowPopUp(false);
    };

    const renderItem: ListRenderItem<FeedbackQuestionProps> = ({item}) => (
        <FeedbackQuestion {...item} />
    );

    const [hideFeedback, setHideFeedback] = useState<boolean>(false);
    const safeHideFeedback = useSafeSelector<boolean>(
        (state) => state.settings?.hideFeedback,
    );
    useEffect(() => {
        safeHideFeedback.ifJust(setHideFeedback);
    }, [safeHideFeedback]);
    const [loading, setLoading] = useState<boolean>(false);
    const saveFeedback = async () => {
        console.log('upload');
        setLoading(true);
        await safeUser
            .map((user) => {
                fsUpload({
                    type: fsUploadType.update,
                    path: FSPathMap.users.doc(user.id),
                    data: {
                        feedback: {
                            comment:
                                comment.length !== 0
                                    ? comment
                                    : user.feedback?.comment ?? '',
                            answers: answers,
                            saved: serverTimestamp(),
                        },
                    },
                });
            })
            .extract();
        setLoading(false);
        d(setSettings({hideFeedback}));
        navigation.navigate('mainPage');
    };
    return (
        <ScrollView
            style={{
                flex: 1,
                paddingHorizontal: theme.padding,
            }}
            contentContainerStyle={{minHeight: '100%'}}>
            <FlatList
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                data={filteredQestions}
                keyExtractor={(item, i) => i.toString()}

                // columnWrapperStyle={styles.gridRow}
            />
            {/*<CommentPopUp*/}
            {/*/>*/}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: 10,
                    paddingBottom: 20,
                }}>
                <CheckBox
                    onClick={() => setHideFeedback((v) => !v)}
                    checkBoxColor={'#fff'}
                    isChecked={hideFeedback}
                />
                <Text style={styles.label}>{t(`Don't ask again`)}</Text>
            </View>
            <ConfirmButton
                outlined={true}
                title={t('Add comment')}
                onPress={trigger(setShowPopUp)(true)}
            />

            <Condition if={loading}>
                <ActivityIndicator
                    style={styles.saveButton}
                    size={40}
                    color={theme.HIGHLIGHT}
                />
                <ConfirmButton
                    style={styles.saveButton}
                    title={t('Save')}
                    onPress={saveFeedback}
                />
            </Condition>
            <CommentPopUp
                confirm={closePopUp}
                show={showPopUp}
                value={comment}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    userImageBox: {
        paddingVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userImage: {
        borderRadius: 85,
        height: 125,
        width: 125,
    },
    imageLabel: {
        paddingTop: 20,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto-Light',
    },
    label: {
        paddingLeft: 10,
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: '#FFF',
    },
    saveButton: {
        marginVertical: 15,
    },
    // gridRow: {
    //     justifyContent: 'space-around',
    // },
});

export default Feedback;
