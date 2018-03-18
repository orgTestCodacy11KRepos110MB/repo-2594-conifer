import React, { Component } from 'react';
import PropTypes from 'prop-types';

import config from 'config';

import { addTrailingSlash, apiFetch, fixMalformedUrls,
         remoteBrowserMod } from 'helpers/utils';

import { ExtractWidget, RemoteBrowserSelect } from 'containers';

import './style.scss';


class NewRecordingUI extends Component {
  static contextTypes = {
    canAdmin: PropTypes.bool,
    currMode: PropTypes.string,
    router: PropTypes.object
  }

  static propTypes = {
    collection: PropTypes.object,
    extractable: PropTypes.object,
    params: PropTypes.object,
    remoteBrowserSelected: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      recTitle: config.defaultRecordingTitle,
      url: ''
    };
  }

  handeSubmit = (evt) => {
    evt.preventDefault();
    const { collection, extractable, remoteBrowserSelected } = this.props;
    const { recTitle, url } = this.state;

    // const cleanRecsordingTitle = encodeURIComponent(recTitle.trim());

    const cleanUrl = addTrailingSlash(fixMalformedUrls(url));

    // data to create new recording
    const data = {
      url: cleanUrl,
      coll: collection.get('id'),
    };

    // add remote browser
    if (remoteBrowserSelected) {
      data.browser = remoteBrowserSelected;
    }

    if (extractable) {
      const mode = extractable.get('allSources') ? 'extract' : 'extract_only';
      data.url = extractable.get('targetUrl');
      data.mode = `${mode}:${extractable.get('id')}`;
      data.timestamp = extractable.get('timestamp');
    } else {
      data.mode = 'record';
    }

    // generate recording url
    apiFetch('/new', data, { method: 'POST' })
      .then(res => res.json())
      .then(({ url }) => this.context.router.history.push(url.replace(config.appHost, '')))
      .catch(err => console.log('error', err));
  }

  handleChange = (evt) => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  }

  render() {
    const { collection, extractable } = this.props;
    const { url } = this.state;

    return (
      <React.Fragment>
        <div role="presentation" className="container-fluid wr-controls navbar-default new-recording-ui">
          <div className="main-bar">
            <form className="form-group-recorder-url start-recording" onSubmit={this.handeSubmit}>
              <div className="input-group containerized">
                <div className="input-group-btn rb-dropdown">
                  <RemoteBrowserSelect />
                </div>

                <input type="text" onChange={this.handleChange} className="url-input-recorder form-control" name="url" value={url} autoFocus required />

                <ExtractWidget
                  includeButton
                  toCollection={collection.get('title')}
                  url={url} />

                {
                  !extractable &&
                    <div className="input-group-btn record-action">
                      <button type="submit" className="btn btn-default">
                        Start
                      </button>
                    </div>
                }

              </div>

              {/*<div>
                <span className="recorder-status">Create New Recording</span>
                <label htmlFor="rec-title" className="sr-only">Recording title</label>
                <input name="recTitle" onChange={this.handleChange} type="text" className="left-buffer form-control input-sm title-inline" value={recTitle} required />
              </div>*/}
            </form>
          </div>
        </div>
        <div className="container col-md-4 col-md-offset-4 top-buffer-lg">
          <div className="panel panel-default">
            <div className="panel-heading">
              <span className="glyphicon glyphicon-info-sign" aria-hidden="true" />
              <strong className="left-buffer">Create a new recording</strong>
            </div>
            <div className="panel-body">
              Ready to add a new recording to your collection <b>{collection.get('title')}</b>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default NewRecordingUI;
