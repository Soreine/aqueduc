
import Aqueduc from '../';
import { connect } from '../';

import AqueducServer from '../server';
import { render } from '../server';


test('it should export connect as default', () => {
    expect(Aqueduc).toBeDefined();
    expect(Aqueduc.connect).toBeDefined();
});

test('it should export render as default', () => {
    expect(AqueducServer).toBeDefined();
    expect(AqueducServer.render).toBeDefined();
});

test('it should export connect', () => {
    expect(connect).toBeDefined();
});

test('it should export render', () => {
    expect(render).toBeDefined();
});
