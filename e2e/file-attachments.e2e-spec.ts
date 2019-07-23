import {
  element,
  by
} from 'protractor';

import {
  expect,
  SkyHostBrowser
} from '@skyux-sdk/e2e';

describe('File attachments', () => {
  it('should match previous file drop screenshot', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('lg');
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop'
    });
  });

  it('should match previous file drop screenshot (screen: xs)', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('xs');
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-xs'
    });
  });

  it('should match previous file drop screenshot when no links allowed', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('.sky-test-allow-links')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-no-links'
    });
  });

  it('should match previous file drop screenshot (screen: xs)', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('xs');
    element(by.css('.sky-test-allow-links')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-no-links-xs'
    });
  });

  it('should match previous file attachments screenshot when required', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('.sky-test-required')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-required'
    });
  });

  it('should match previous file drop screenshot (screen: xs)', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('xs');
    element(by.css('.sky-test-required')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-required-xs'
    });
  });

  it('should match previous file attachments screenshot when label set', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('.sky-test-label')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-label'
    });
  });

  it('should match previous file drop screenshot (screen: xs)', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('xs');
    element(by.css('.sky-test-label')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-label-xs'
    });
  });

  it('should match previous file attachments screenshot when required and label set', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('.sky-test-required')).click();
    element(by.css('.sky-test-label')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-required-label'
    });
  });

  it('should match previous file drop screenshot (screen: xs)', (done) => {
    SkyHostBrowser.get('visual/file-attachment');
    SkyHostBrowser.setWindowBreakpoint('xs');
    element(by.css('.sky-test-required')).click();
    element(by.css('.sky-test-label')).click();
    expect('#screenshot-file-drop').toMatchBaselineScreenshot(done, {
      screenshotName: 'file-drop-required-label-xs'
    });
  });
});
