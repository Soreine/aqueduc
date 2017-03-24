
import Aqueduc from '../';
import { connect } from '../';

test('it should export connect as default', () => {
    expect(Aqueduc).toBeDefined();
    expect(Aqueduc.connect).toBeDefined();
});

test('it should export connect', () => {
    expect(connect).toBeDefined();
});
