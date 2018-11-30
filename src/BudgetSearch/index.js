import store, { budgetUpdated, loadList } from '../store.js';
import { createComponent } from 'melody-component';
import { createStructuredSelector } from 'reselect';
import { connect, provide } from 'melody-redux';
import { compose, withRefs, lifecycle } from 'melody-hoc';
import template from './index.twig';

const enhance = compose(
    connect(
        () => createStructuredSelector({
            userBudget: state => state.userBudget,
            currentList: state => state.currentList,
        }),
        { budgetUpdated, loadList }
    ),

    withRefs(component => ({
        searchInput: el => {
            const handler = event => {
                component.state.budgetUpdated(el.value);
                event.preventDefault();
            };
            el.addEventListener('input', handler, false);
            return {
                unsubscribe() {
                    el.removeEventListener('input', handler, false);
                },
            };
        },
    })),

    lifecycle({
        componentDidMount() {
            const { loadList } = this.getState();
            loadList();
        },
    }),
);

export default provide(
    store,
    enhance(createComponent(template))
);