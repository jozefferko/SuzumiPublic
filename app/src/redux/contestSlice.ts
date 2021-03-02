import {FSContestEntry} from '../common/types/firestore';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type SliceState = {[id: string]: FSContestEntry};

// First approach: define the initial state using that type
export const contestSlice = createSlice({
    name: 'contest',
    initialState: {} as SliceState,
    reducers: {
        setContest: (
            state,
            action: PayloadAction<{[id: string]: FSContestEntry}>,
        ) => action.payload,
    },
});
export const {setContest} = contestSlice.actions;
