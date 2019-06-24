import {
  TestBed,
  ComponentFixture,
  async
} from '@angular/core/testing';

import {
  Component,
  DebugElement,
  NO_ERRORS_SCHEMA,
  ViewChild
} from '@angular/core';

import {
  By
} from '@angular/platform-browser';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyFileDropComponent
} from './file-drop.component';

import {
  SkyFileAttachmentsModule
} from './file-attachments.module';

import {
  SkyFileDropChange
} from './file-drop-change';

import {
  SkyFileLink
} from './file-link';

import {
  SkyFileItem
} from './file-item';
import { SkyFileDropLabelComponent } from './file-drop-label.component';

describe('File drop component', () => {

  /** Simple test component with tabIndex */
  @Component({
    template: `
      <sky-file-drop>
        <div class="sky-custom-drop"></div>
        <sky-file-drop-label>
          Field Label
        </sky-file-drop-label>
      </sky-file-drop>`
  })
  class FileDropContentComponent { }

  let fixture: ComponentFixture<SkyFileDropComponent>;
  let el: any;
  let componentInstance: SkyFileDropComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SkyFileAttachmentsModule
      ],
      declarations: [
        FileDropContentComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkyFileDropComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
    componentInstance = fixture.componentInstance;
  });

  //#region helper functions
  function getInputDebugEl() {
    return fixture.debugElement.query(By.css('input.sky-file-input-hidden'));
  }

  function getDropEl() {
    return el.querySelector('.sky-file-drop');
  }

  function getDropDebugEl() {
    return fixture.debugElement.query(By.css('.sky-file-drop'));
  }

  function getDropElWrapper() {
    return el.querySelector('.sky-file-drop-col');
  }

  function getDropWrapper() {
    return el.querySelector('.sky-file-drop-row');
  }

  function getLabelWrapper() {
    return el.querySelector('.sky-file-drop-label-wrapper');
  }

  function validateDropClasses(hasAccept: boolean, hasReject: boolean, dropEl: any) {
    expect(dropEl.classList.contains('sky-file-drop-accept')).toBe(hasAccept);
    expect(dropEl.classList.contains('sky-file-drop-reject')).toBe(hasReject);
  }

  function getLinkInput() {
    return fixture.debugElement.query(By.css('.sky-file-drop-link input'));
  }

  function getLinkButton() {
    return fixture.debugElement.query(By.css('.sky-file-drop-link button'));
  }

  function testClick(expectedResult: boolean) {
    let inputClicked = false;

    fixture.detectChanges();

    let inputEl = getInputDebugEl();

    spyOn((<any>inputEl.references).fileInput, 'click').and.callFake(function () {
      inputClicked = true;
    });

    let dropEl = getDropEl();

    dropEl.click();

    fixture.detectChanges();

    expect(inputClicked).toBe(expectedResult);
  }

  function triggerChangeEvent(expectedChangeFiles: any[]) {
    let inputEl = getInputDebugEl();

    let fileChangeEvent = {
      target: {
        files: {
          length: expectedChangeFiles.length,
          item: function (index: number) {
            return expectedChangeFiles[index];
          }
        }
      }
    };

    inputEl.triggerEventHandler('change', fileChangeEvent);
  }

  function setupFileReaderSpy() {
    let loadCallbacks: Function[] = [];
    let errorCallbacks: Function[] = [];
    let abortCallbacks: Function[] = [];

    spyOn((window as any), 'FileReader').and.returnValue({
      readAsDataURL: function(file: any) {

      },
      addEventListener: function(type: string, callback: Function) {
        if (type === 'load') {
          loadCallbacks.push(callback);
        } else if (type === 'error') {
          errorCallbacks.push(callback);
        } else if (type === 'abort') {
          abortCallbacks.push(callback);
        }
      }
    });

    return {
      loadCallbacks: loadCallbacks,
      errorCallbacks: errorCallbacks,
      abortCallbacks: abortCallbacks
    };
  }

  function setupStandardFileChangeEvent(files?: Array<any>) {
    let fileReaderSpy = setupFileReaderSpy();

    if (!files) {
      files = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        },
        {
          name: 'woo.txt',
          size: 2000,
          type: 'image/jpeg'
        }
      ];
    }
    triggerChangeEvent(files);

    fixture.detectChanges();

    if (fileReaderSpy.loadCallbacks[0]) {
       fileReaderSpy.loadCallbacks[0]({
        target: {
          result: 'url'
        }
      });
    }

    if (fileReaderSpy.loadCallbacks[1]) {
      fileReaderSpy.loadCallbacks[1]({
        target: {
          result: 'newurl'
        }
      });
    }

    fixture.detectChanges();
  }

  function triggerDragEnter(enterTarget: any, dropDebugEl: DebugElement) {
    let dragEnterPropStopped = false;
    let dragEnterPreventDefault = false;

    let dragEnterEvent = {
      target: enterTarget,
      stopPropagation: function () {
        dragEnterPropStopped = true;
      },
      preventDefault: function () {
        dragEnterPreventDefault = true;
      }
    };

    dropDebugEl.triggerEventHandler('dragenter', dragEnterEvent);
    fixture.detectChanges();
    expect(dragEnterPreventDefault).toBe(true);
    expect(dragEnterPropStopped).toBe(true);
  }

  function triggerDragOver(files: any, dropDebugEl: DebugElement) {
    let dragOverPropStopped = false;
    let dragOverPreventDefault = false;

    let dragOverEvent = {
      dataTransfer: {
        files: {} as any,
        items: files
      },
      stopPropagation: function () {
        dragOverPropStopped = true;
      },
      preventDefault: function () {
        dragOverPreventDefault = true;
      }
    };

    dropDebugEl.triggerEventHandler('dragover', dragOverEvent);
    fixture.detectChanges();
    expect(dragOverPreventDefault).toBe(true);
    expect(dragOverPropStopped).toBe(true);
  }

  function triggerDrop(files: any, dropDebugEl: DebugElement) {
    let dropPropStopped = false;
    let dropPreventDefault = false;
    let fileLength = files ? files.length : 0;

    let dropEvent = {
      dataTransfer: {
        files: {
          length: fileLength,
          item: function (index: number) {
            return files[index];
          }
        },
        items: files
      },
      stopPropagation: function () {
        dropPropStopped = true;
      },
      preventDefault: function () {
        dropPreventDefault = true;
      }
    };

    dropDebugEl.triggerEventHandler('drop', dropEvent);
    fixture.detectChanges();
    expect(dropPreventDefault).toBe(true);
    expect(dropPropStopped).toBe(true);
  }

  function triggerDragLeave(leaveTarget: any, dropDebugEl: DebugElement) {

    let dragLeaveEvent = {
      target: leaveTarget
    };

    dropDebugEl.triggerEventHandler('dragleave', dragLeaveEvent);
    fixture.detectChanges();
  }

  function triggerInputChange(value: string, linkInput: DebugElement) {
    linkInput.triggerEventHandler('input', {target: {value: value}});
    fixture.detectChanges();
  }
  //#endregion

  it('should create the file drop control', () => {

    fixture.detectChanges();

    let dropEl = getDropEl();

    expect(dropEl).toBeTruthy();
    validateDropClasses(false, false, dropEl);

    let inputEl = getInputDebugEl();
    expect((<any>inputEl.references).fileInput).toBeTruthy();
  });

  it('should click the file input on file drop click', () => {
    testClick(true);
  });

  it('should prevent click when noclick is specified', () => {
    componentInstance.noClick = true;
    fixture.detectChanges();
    testClick(false);
  });

  it('should load and emit files on file change event', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.files.length).toBe(2);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);

    expect(filesChangedActual.files[1].url).toBe('newurl');
    expect(filesChangedActual.files[1].file.name).toBe('woo.txt');
    expect(filesChangedActual.files[1].file.size).toBe(2000);
  });

  it('should load and emit files on file change event when file reader has an error and aborts',
  () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    fixture.detectChanges();

    let fileReaderSpy = setupFileReaderSpy();

    triggerChangeEvent([
      {
        name: 'foo.txt',
        size: 1000
      },
      {
        name: 'woo.txt',
        size: 2000
      },
      {
        name: 'goo.txt',
        size: 3000
      }
    ]);

    fixture.detectChanges();

    fileReaderSpy.abortCallbacks[0]();

    fileReaderSpy.loadCallbacks[1]({
      target: {
        result: 'anotherurl'
      }
    });

    fileReaderSpy.errorCallbacks[2]();

    fixture.detectChanges();

    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('anotherurl');
    expect(filesChangedActual.files[0].file.name).toBe('woo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(2000);

    expect(filesChangedActual.rejectedFiles.length).toBe(2);

    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(1000);

    expect(filesChangedActual.rejectedFiles[1].file.name).toBe('goo.txt');
    expect(filesChangedActual.rejectedFiles[1].file.size).toBe(3000);
  });

  it('should allow the user to specify to not allow multiple files', () => {
    componentInstance.multiple = false;
    fixture.detectChanges();
    let inputEl = getInputDebugEl();

    expect(inputEl.nativeElement.hasAttribute('multiple')).toBe(false);

    componentInstance.multiple = true;
    fixture.detectChanges();
    expect(inputEl.nativeElement.hasAttribute('multiple')).toBe(true);
  });

  it('should set accepted types on the file input html', () => {
    componentInstance.acceptedTypes = 'image/png';
    fixture.detectChanges();
    let inputEl = getInputDebugEl();

    expect(inputEl.nativeElement.getAttribute('accept')).toBe('image/png');

  });

  it('should allow the user to specify a min file size', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.minFileSize = 1500;
    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.rejectedFiles.length).toBe(1);
    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(1000);
    expect(filesChangedActual.rejectedFiles[0].errorType).toBe('minFileSize');
    expect(filesChangedActual.rejectedFiles[0].errorParam).toBe('1500');

    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('woo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(2000);
  });

  it('should allow the user to specify a max file size', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.maxFileSize = 1500;
    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.rejectedFiles.length).toBe(1);
    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('woo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(2000);
    expect(filesChangedActual.rejectedFiles[0].errorType).toBe('maxFileSize');
    expect(filesChangedActual.rejectedFiles[0].errorParam).toBe('1500');

    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);
  });

  it('should allow the user to specify a validation function', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    let errorMessage = 'You may not upload a file that begins with the letter "w."';

    componentInstance.validateFn = function(file: any) {
      if (file.file.name.indexOf('w') === 0) {
        return errorMessage;
      }
    };

    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.rejectedFiles.length).toBe(1);
    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('woo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(2000);
    expect(filesChangedActual.rejectedFiles[0].errorType).toBe('validate');
    expect(filesChangedActual.rejectedFiles[0].errorParam).toBe(errorMessage);

    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);
  });

  it('should allow the user to specify accepted types', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.acceptedTypes = 'image/png,image/tiff';

    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.rejectedFiles.length).toBe(1);
    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('woo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(2000);
    expect(filesChangedActual.rejectedFiles[0].errorType).toBe('fileType');
    expect(filesChangedActual.rejectedFiles[0].errorParam).toBe(componentInstance.acceptedTypes);

    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);
  });

  it('should reject a file with no type when accepted types are defined', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.acceptedTypes = 'image/png,image/tiff';

    fixture.detectChanges();

    let files = [
      {
        name: 'foo.txt',
        size: 1000
      },
      {
        name: 'woo.txt',
        size: 2000,
        type: 'image/jpeg'
      }
    ];

    setupStandardFileChangeEvent(files);

    expect(filesChangedActual.rejectedFiles.length).toBe(2);
    expect(filesChangedActual.rejectedFiles[1].file.name).toBe('woo.txt');
    expect(filesChangedActual.rejectedFiles[1].file.size).toBe(2000);
    expect(filesChangedActual.rejectedFiles[1].errorType).toBe('fileType');
    expect(filesChangedActual.rejectedFiles[1].errorParam).toBe(componentInstance.acceptedTypes);

    expect(filesChangedActual.rejectedFiles[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.rejectedFiles[0].file.size).toBe(1000);
    expect(filesChangedActual.rejectedFiles[0].errorType).toBe('fileType');
    expect(filesChangedActual.rejectedFiles[0].errorParam).toBe(componentInstance.acceptedTypes);

  });

  it('should allow the user to specify accepted type with wildcards', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.acceptedTypes = 'application/*,image/*';

    fixture.detectChanges();

    setupStandardFileChangeEvent();

    expect(filesChangedActual.rejectedFiles.length).toBe(0);

    expect(filesChangedActual.files.length).toBe(2);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);
    expect(filesChangedActual.files[1].url).toBe('newurl');
    expect(filesChangedActual.files[1].file.name).toBe('woo.txt');
    expect(filesChangedActual.files[1].file.size).toBe(2000);
  });

  it('should allow the user to specify if the file is required', () => {
    componentInstance.required = false;
    fixture.detectChanges();
    let dropWrapper = getDropWrapper();

    expect(dropWrapper.classList.contains('sky-file-drop-required')).toBe(false);

    componentInstance.required = true;
    fixture.detectChanges();
    expect(dropWrapper.classList.contains('sky-file-drop-required')).toBe(true);
  });

  it('should mark the field label as required when specified', () => {
    componentInstance.required = false;
    fixture.detectChanges();
    let labelWrapper = getLabelWrapper();

    expect(labelWrapper.classList.contains('sky-control-label-required')).toBe(false);

    componentInstance.required = true;
    fixture.detectChanges();

    console.log(componentInstance.hasLabel());
    console.log(labelWrapper);
    // let content = el.querySelector('.sky-file-drop-label-wrapper sky-file-drop-label');
    // console.log(content);

    expect(labelWrapper.classList.contains('sky-control-label-required')).toBe(true);
  });

  it('should load files and set classes on drag and drop', () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    let fileReaderSpy = setupFileReaderSpy();

    componentInstance.acceptedTypes = 'image/png, image/tiff';

    fixture.detectChanges();

    let dropDebugEl = getDropDebugEl();

    let files = [
      {
        name: 'foo.txt',
        size: 1000,
        type: 'image/png'
      }
    ];

    let invalidFiles = [
      {
        name: 'foo.txt',
        size: 1000,
        type: 'image/jpeg'
      }
    ];

    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver(files, dropDebugEl);
    let dropElWrapper = getDropElWrapper();

    validateDropClasses(true, false, dropElWrapper);

    triggerDrop(files, dropDebugEl);

    validateDropClasses(false, false, dropElWrapper);

    fileReaderSpy.loadCallbacks[0]({
      target: {
        result: 'url'
      }
    });

    fixture.detectChanges();

    expect(filesChangedActual.rejectedFiles.length).toBe(0);
    expect(filesChangedActual.files.length).toBe(1);
    expect(filesChangedActual.files[0].url).toBe('url');
    expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
    expect(filesChangedActual.files[0].file.size).toBe(1000);

    // Verify reject classes when appropriate
    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver(invalidFiles, dropDebugEl);
    validateDropClasses(false, true, dropElWrapper);
    triggerDragLeave('something', dropDebugEl);
    validateDropClasses(false, true, dropElWrapper);
    triggerDragLeave('sky-drop', dropDebugEl);
    validateDropClasses(false, false, dropElWrapper);

    // Verify empty file array
    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver([], dropDebugEl);
    validateDropClasses(false, false, dropElWrapper);

    let emptyEvent = {
      stopPropagation: function () {},
      preventDefault: function () {}
    };

    // Verify no dataTransfer drag
    dropDebugEl.triggerEventHandler('dragover', emptyEvent);
    fixture.detectChanges();
    validateDropClasses(false, false, dropElWrapper);

    // Verify no dataTransfer drop
    fileReaderSpy.loadCallbacks = [];
    dropDebugEl.triggerEventHandler('drop', emptyEvent);
    fixture.detectChanges();
    expect(fileReaderSpy.loadCallbacks.length).toBe(0);

  });

  it([
    'should accept a file of rejected type on drag (but not on drop)',
    'if the browser does not support dataTransfer.items'
  ].join(' '), () => {
    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    componentInstance.acceptedTypes = 'image/png, image/tiff';

    fixture.detectChanges();

    let dropDebugEl = getDropDebugEl();

    let invalidFiles = [
      {
        name: 'foo.txt',
        size: 1000,
        type: 'image/jpeg'
      }
    ];

    let dropElWrapper = getDropElWrapper();

    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver(undefined, dropDebugEl);
    validateDropClasses(true, false, dropElWrapper);

    triggerDrop(invalidFiles, dropDebugEl);
    validateDropClasses(false, false, dropElWrapper);
  });

  it('should prevent loading multiple files on drag and drop when multiple is false', () => {
    let files = [
      {
        name: 'foo.txt',
        size: 1000,
        type: 'image/png'
      },
      {
        name: 'goo.txt',
        size: 1000,
        type: 'image/png'
      }
    ];

    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    let fileReaderSpy = setupFileReaderSpy();

    componentInstance.multiple = false;
    fixture.detectChanges();

    let dropDebugEl = getDropDebugEl();

    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver(files, dropDebugEl);
    triggerDrop(files, dropDebugEl);
    expect(fileReaderSpy.loadCallbacks.length).toBe(0);
  });

  it('should prevent loading directories on drag and drop', () => {
    let files = [
      {
        name: 'foo.txt',
        size: 1000,
        type: 'image/png',
        webkitGetAsEntry: function () {
          return {
            isDirectory: true
          };
        }
      }
    ];

    let filesChangedActual: SkyFileDropChange;

    componentInstance.filesChanged.subscribe(
      (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

    let fileReaderSpy = setupFileReaderSpy();
    fixture.detectChanges();

    let dropDebugEl = getDropDebugEl();

    triggerDragEnter('sky-drop', dropDebugEl);
    triggerDragOver(files, dropDebugEl);
    triggerDrop(files, dropDebugEl);
    expect(fileReaderSpy.loadCallbacks.length).toBe(0);
  });

  it('should show link section when allowLinks is true', () => {
    componentInstance.allowLinks = true;
    fixture.detectChanges();

    let linkInput = getLinkInput();

    expect(linkInput).toBeTruthy();
  });

  it('should emit link event when link is added on click', () => {
    let fileLinkActual: SkyFileLink;

    componentInstance.linkChanged.subscribe(
      (newLink: SkyFileLink) => fileLinkActual = newLink );

    componentInstance.allowLinks = true;
    fixture.detectChanges();

    let linkInput = getLinkInput();

    triggerInputChange('link.com', linkInput);

    let linkButton = getLinkButton();
    linkButton.nativeElement.click();
    fixture.detectChanges();

    expect(fileLinkActual.url).toBe('link.com');
  });

  it('should emit link event when link is added on enter press', () => {
    let fileLinkActual: SkyFileLink;

    componentInstance.linkChanged.subscribe(
      (newLink: SkyFileLink) => fileLinkActual = newLink );

    componentInstance.allowLinks = true;
    fixture.detectChanges();

    let linkInput = getLinkInput();

    triggerInputChange('link.com', linkInput);

    linkInput.triggerEventHandler('keyup', { which: 23, preventDefault: function () {} });
    fixture.detectChanges();

    expect(fileLinkActual).toBeFalsy();

    linkInput.triggerEventHandler('keyup', { which: 13, preventDefault: function () {} });
    fixture.detectChanges();

    expect(fileLinkActual.url).toBe('link.com');
  });

  it('should allow custom content inside of the file drop component', () => {
    let contentFixture = TestBed.createComponent(FileDropContentComponent);

    contentFixture.detectChanges();

    expect(contentFixture.debugElement.query(By.css('.sky-file-drop-contents'))).toBeFalsy();
    expect(contentFixture.debugElement.query(
      By.css('.sky-file-drop-contents-custom .sky-custom-drop'))).toBeTruthy();
  });

  it('Should specify type="button" on all button elements.', () => {
    fixture.detectChanges();
    expect(el.querySelectorAll('button:not([type])').length).toBe(0);
    expect(el.querySelectorAll('button[type="submit"]').length).toBe(0);
    expect(el.querySelectorAll('button[type="button"]').length).toBe(1);
  });

  it('should pass accessibility', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  }));

  describe('Single file attachment', () => {

    beforeEach(() => {
      componentInstance.singleFile = true;
      fixture.detectChanges();
    });

    function getInputDebugEl() {
      return fixture.debugElement.query(By.css('input.sky-file-input-hidden'));
    }

    function getButtonEl() {
      return el.querySelector('.sky-single-file-btn');
    }

    // function getButtonDebugEl() {
    //   return fixture.debugElement.query(By.css('.sky-single-file-btn'));
    // }

    function getDropEl() {
      return el.querySelector('.sky-single-file-drop');
    }

    function getDropDebugEl() {
      return fixture.debugElement.query(By.css('.sky-single-file-drop'));
    }

    function getFileNameEl() {
      return el.querySelector('.sky-file-name');
    }

    function getFileNameText() {
      return el.querySelector('.sky-file-name-text').textContent.trim();
    }

    function getDeleteEl() {
      return el.querySelector('.sky-file-delete');
    }

    function validateDropClasses(hasAccept: boolean, hasReject: boolean, dropEl: any) {
      expect(dropEl.classList.contains('sky-single-file-drop-accept')).toBe(hasAccept);
      expect(dropEl.classList.contains('sky-single-file-drop-reject')).toBe(hasReject);
    }

    function getImage() {
      return fixture.debugElement.query(By.css('.sky-file-item-preview-img'));
    }

    function testImage(extension: string) {
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: 'myFile.' + extension,
          type: 'image/' + extension,
          size: 1000
        },
        url: 'myFile.' + extension
      };

      fixture.detectChanges();

      let imageEl = getImage();
      expect(imageEl.nativeElement.getAttribute('src')).toBe('myFile.' + extension);

      // Test Accessibility
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement).toBeAccessible();
      });
    }

    function testOtherTypes(extension: string, type: string) {
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: 'myFile.' + extension,
          type:  type + '/' + extension,
          size: 1000
        },
        url: 'myFile.' + extension
      };
      fixture.detectChanges();

      let imageEl = getImage();
      expect(imageEl).toBeFalsy();

      // Test Accessibility
      fixture.whenStable().then(() => {
        expect(fixture.nativeElement).toBeAccessible();
      });
    }

    it('should allow the user to specify if the file is required', () => {
      componentInstance.required = false;
      fixture.detectChanges();
      let buttonEl = getButtonEl();

      expect(buttonEl.classList.contains('sky-file-drop-required')).toBe(false);

      componentInstance.required = true;
      fixture.detectChanges();
      expect(buttonEl.classList.contains('sky-file-drop-required')).toBe(true);
    });

    xit('should mark the field label as required when specified', () => {
      componentInstance.required = false;
      fixture.detectChanges();
      let labelWrapper = getLabelWrapper();

      expect(labelWrapper.classList.contains('sky-control-label-required')).toBe(false);

      componentInstance.required = true;
      fixture.detectChanges();
      expect(labelWrapper.classList.contains('sky-control-label-required')).toBe(true);
    });

    it('should click the file input on choose file button click', () => {
      let inputClicked = false;

      fixture.detectChanges();

      let inputEl = getInputDebugEl();

      spyOn((<any>inputEl.references).fileInput, 'click').and.callFake(function () {
        inputClicked = true;
      });

      let dropEl = getButtonEl();

      dropEl.click();

      fixture.detectChanges();

      expect(inputClicked).toBe(true);
    });

    it('should click the file input on text click', () => {
      let inputClicked = false;

      fixture.detectChanges();

      let inputEl = getInputDebugEl();

      spyOn((<any>inputEl.references).fileInput, 'click').and.callFake(function () {
        inputClicked = true;
      });

      let textEl = getFileNameEl();

      textEl.click();

      fixture.detectChanges();

      expect(inputClicked).toBe(true);
    });

    it('should not click the file input on remove button click', () => {
      let inputClicked = false;

      fixture.detectChanges();

      let inputEl = getInputDebugEl();

      spyOn((<any>inputEl.references).fileInput, 'click').and.callFake(function () {
        inputClicked = true;
      });

      fixture.detectChanges();

      let file = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        }
      ];

      setupStandardFileChangeEvent(file);

      let deleteEl = getDeleteEl();

      deleteEl.click();

      fixture.detectChanges();

      expect(inputClicked).toBe(false);
    });

    // Maybe some other tests here about dragging
    it('should load and emit file on file change event', () => {
      let filesChangedActual: SkyFileDropChange;

      componentInstance.filesChanged.subscribe(
        (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

      fixture.detectChanges();

      let file = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        }
      ];

      setupStandardFileChangeEvent(file);

      expect(filesChangedActual.files.length).toBe(1);
      expect(filesChangedActual.files[0].url).toBe('url');
      expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
      expect(filesChangedActual.files[0].file.size).toBe(1000);
    });

    // Maybe some other tests here about setting the file
    it('should clear file on remove press', () => {
      let filesChangedActual: SkyFileDropChange;

      componentInstance.filesChanged.subscribe(
        (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

      fixture.detectChanges();

      let file = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        }
      ];

      setupStandardFileChangeEvent(file);

      let deleteEl = getDeleteEl();

      deleteEl.click();

      fixture.detectChanges();

      expect(filesChangedActual.files.length).toBe(0);
    });

    it('should truncate the file name when too long', () => {

      // let file = [
      //   {
      //     name: 'abcdefghijklmnopqrstuvwxyz12345.txt',
      //     size: 1000,
      //     type: 'image/png'
      //   }
      // ];

      // setupStandardFileChangeEvent(file);

      // Regular file
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: 'test.png',
          size: 1000,
          type: 'image/png'
        },
        url: 'myFile'
      };
      fixture.detectChanges();

      expect(getFileNameText()).toBe('test.png');

      // File with truncated name
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: 'abcdefghijklmnopqrstuvwxyz12345.png',
          size: 1000,
          type: 'image/png'
        },
        url: 'myFile'
      };
      fixture.detectChanges();

      expect(getFileNameText()).toBe('abcdefghijklmnopqrstuvwxyz....');

      // File with no name
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: undefined,
          size: 1000,
          type: 'image/png'
        },
        url: 'myFile'
      };
      fixture.detectChanges();

      expect(getFileNameText()).toBe('myFile');

      // File with no name and truncated url
      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: undefined,
          size: 1000,
          type: 'image/txt'
        },
        url: 'abcdefghijklmnopqrstuvwxyz12345'
      };
      fixture.detectChanges();

      expect(getFileNameText()).toBe('abcdefghijklmnopqrstuvwxyz....');
    });

    it('should load files and set classes on drag and drop', () => {
      let filesChangedActual: SkyFileDropChange;

      componentInstance.filesChanged.subscribe(
        (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

      let fileReaderSpy = setupFileReaderSpy();

      componentInstance.acceptedTypes = 'image/png, image/tiff';

      fixture.detectChanges();

      let dropDebugEl = getDropDebugEl();
      let dropEl = getDropEl();

      let files = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        }
      ];

      let invalidFiles = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/jpeg'
        }
      ];

      triggerDragEnter('sky-drop', dropDebugEl);
      triggerDragOver(files, dropDebugEl);

      validateDropClasses(true, false, dropEl);

      triggerDrop(files, dropDebugEl);

      validateDropClasses(false, false, dropEl);

      fileReaderSpy.loadCallbacks[0]({
        target: {
          result: 'url'
        }
      });

      fixture.detectChanges();

      expect(filesChangedActual.rejectedFiles.length).toBe(0);
      expect(filesChangedActual.files.length).toBe(1);
      expect(filesChangedActual.files[0].url).toBe('url');
      expect(filesChangedActual.files[0].file.name).toBe('foo.txt');
      expect(filesChangedActual.files[0].file.size).toBe(1000);

      // Verify reject classes when appropriate
      triggerDragEnter('sky-drop', dropDebugEl);
      triggerDragOver(invalidFiles, dropDebugEl);
      validateDropClasses(false, true, dropEl);
      triggerDragLeave('something', dropDebugEl);
      validateDropClasses(false, true, dropEl);
      triggerDragLeave('sky-drop', dropDebugEl);
      validateDropClasses(false, false, dropEl);

      // Verify empty file array
      triggerDragEnter('sky-drop', dropDebugEl);
      triggerDragOver([], dropDebugEl);
      validateDropClasses(false, false, dropEl);

      let emptyEvent = {
        stopPropagation: function () {},
        preventDefault: function () {}
      };

      // Verify no dataTransfer drag
      dropDebugEl.triggerEventHandler('dragover', emptyEvent);
      fixture.detectChanges();
      validateDropClasses(false, false, dropEl);

      // Verify no dataTransfer drop
      fileReaderSpy.loadCallbacks = [];
      dropDebugEl.triggerEventHandler('drop', emptyEvent);
      fixture.detectChanges();
      expect(fileReaderSpy.loadCallbacks.length).toBe(0);

    });

    it([
      'should accept a file of rejected type on drag (but not on drop)',
      'if the browser does not support dataTransfer.items'
    ].join(' '), () => {
      let filesChangedActual: SkyFileDropChange;

      componentInstance.filesChanged.subscribe(
        (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

      componentInstance.acceptedTypes = 'image/png, image/tiff';

      fixture.detectChanges();

      let dropDebugEl = getDropDebugEl();

      let invalidFiles = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/jpeg'
        }
      ];

      let dropEl = getDropEl();

      triggerDragEnter('sky-drop', dropDebugEl);
      triggerDragOver(undefined, dropDebugEl);
      validateDropClasses(true, false, dropEl);

      triggerDrop(invalidFiles, dropDebugEl);
      validateDropClasses(false, false, dropEl);
    });

    it('should prevent loading multiple files on drag and drop', () => {
      let files = [
        {
          name: 'foo.txt',
          size: 1000,
          type: 'image/png'
        },
        {
          name: 'goo.txt',
          size: 1000,
          type: 'image/png'
        }
      ];

      let filesChangedActual: SkyFileDropChange;

      componentInstance.filesChanged.subscribe(
        (filesChanged: SkyFileDropChange) => filesChangedActual = filesChanged );

      let fileReaderSpy = setupFileReaderSpy();

      let dropDebugEl = getDropDebugEl();

      triggerDragEnter('sky-drop', dropDebugEl);
      triggerDragOver(files, dropDebugEl);
      triggerDrop(files, dropDebugEl);
      expect(fileReaderSpy.loadCallbacks.length).toBe(0);
    });

    it('shows the thumbnail if the item is an image', () => {
      testImage('png');
      testImage('bmp');
      testImage('jpeg');
      testImage('gif');
    });

    it('does not show an icon if it is not an image', () => {
      testOtherTypes('pdf', 'pdf');
      testOtherTypes('gz', 'gz');
      testOtherTypes('rar', 'rar');
      testOtherTypes('tgz', 'tgz');
      testOtherTypes('zip', 'zip');
      testOtherTypes('ppt', 'ppt');
      testOtherTypes('pptx', 'pptx');
      testOtherTypes('doc', 'doc');
      testOtherTypes('docx', 'docx');
      testOtherTypes('xls', 'xls');
      testOtherTypes('xlsx', 'xlsx');
      testOtherTypes('txt', 'txt');
      testOtherTypes('htm', 'htm');
      testOtherTypes('html', 'html');
      testOtherTypes('mp3', 'audio');
      testOtherTypes('tiff', 'image');
      testOtherTypes('other', 'text');
      testOtherTypes('mp4', 'video');
    });

    it('should not show an icon if file or type does not exist', () => {
      let imageEl = getImage();
      expect(imageEl).toBeFalsy();

      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: undefined,
        url: 'myFile'
      };
      fixture.detectChanges();

      expect(imageEl).toBeFalsy();

      componentInstance.singleFileAttachment = <SkyFileItem> {
        file: {
          name: 'myFile.png',
          type: undefined,
          size: 1000
        },
        url: 'myFile'
      };
      fixture.detectChanges();

      expect(imageEl).toBeFalsy();
    });

    it('should pass accessibility', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  }));
  });
});

// @Component({
//   selector: 'test-wrapper',
//   template: `
//   <sky-file-drop>
//     <sky-file-drop-label>
//       Field Label
//     </sky-file-drop-label>
//   </sky-file-drop>`
// })
// class TestWrapperComponent {
//   @ViewChild(SkyFileDropComponent) public myDrop: SkyFileDropLabelComponent;
// }

// describe('Test Label', () => {
//   let component: SkyFileDropLabelComponent;
//   let fixture: ComponentFixture<TestWrapperComponent>;

//   beforeEach(async() => {
//     TestBed.configureTestingModule({
//       imports: [
//         SkyFileAttachmentsModule
//       ],
//       declarations: [
//         TestWrapperComponent,
//         SkyFileDropComponent,
//         SkyFileDropLabelComponent
//       ]
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TestWrapperComponent);
//     fixture.detectChanges();
//     component = fixture.componentInstance.myDrop;
//     fixture.detectChanges();
//   });

//   it('should set the label on init', () => {
//     console.log(component);
//     expect(false).toBe(true);
//   });
// });
