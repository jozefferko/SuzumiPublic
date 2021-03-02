import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    Boolean,
    Literal,
    Number,
    Record,
    Static,
    String,
    Union,
} from 'runtypes';

const FcmTopcis = Record({
    unicast: String,
    broadcast: String,
});

const DaysOpened = Record({lastDate: Number, streak: Number});
export const SettingsSliceState = Record({
    language: Union(Literal('en'), Literal('dk')),
    firstOpen: Boolean,
    daysOpened: DaysOpened,
    lastOfferSeen: Number,
    fcmTopics: FcmTopcis,
    notifications: Boolean,
    hideFeedback: Boolean,
});

const datesAreOnSameDay = (first: Date, second: Date): boolean =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: null as Static<typeof SettingsSliceState> | null,
    reducers: {
        setSettings: (
            state,
            action: PayloadAction<Partial<Static<typeof SettingsSliceState>>>,
        ) =>
            state
                ? {
                      ...state,
                      ...action.payload,
                  }
                : state,
        setFcmTopic: (
            state,
            action: PayloadAction<Partial<Static<typeof FcmTopcis>>>,
        ) =>
            state
                ? {
                      ...state,
                      fcmTopics: {
                          ...state.fcmTopics,
                          ...action.payload,
                      },
                  }
                : state,
        // logUsage: (state, action: PayloadAction<Static<typeof DaysOpened>>) => {
        //     const yesterday = new Date();
        //     yesterday.setDate(yesterday.getDate() - 1);
        //     const newDate = new Date(action.payload);
        //     console.log(yesterday.toISOString());
        //     return !state ||
        //         !datesAreOnSameDay(new Date(state.daysOpened.lastDate), newDate)
        //         ? state
        //         : datesAreOnSameDay(yesterday, newDate)
        //         ? {
        //               ...state,
        //               daysOpened: {
        //                   lastDate: action.payload,
        //                   streak: 1 + state.daysOpened.streak,
        //               },
        //           }
        //         : {
        //               ...state,
        //               daysOpened: {lastDate: action.payload, streak: 1},
        //           };
        // },
        hydrateSettings: (
            state,
            action: PayloadAction<Static<typeof SettingsSliceState>>,
        ) => action.payload,
    },
});
export const {
    setSettings,
    hydrateSettings,
    setFcmTopic,
} = settingsSlice.actions;
