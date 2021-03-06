const React = require('react');
const PropTypes = require('prop-types');

const extensions = require('../../packages/oas-extensions');

const withSpecFetching = require('./SpecFetcher');

const ApiExplorer = require('../../packages/api-explorer/src');
const Logs = require('../../packages/api-logs/index');
const ApiList = require('./ApiList');

require('../../packages/api-logs/main.css');

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brokenExplorerState: false,
      maskErrorMessages: false,
      useNewMarkdownEngine: true,
    };
  }

  experimentToggles() {
    const experiments = {
      'Mask error messages?': {
        description: 'Switch between our different error states: consumer and project/API owner.',
        stateProp: 'maskErrorMessages',
      },
      'Show fully broken state?': {
        description: "Send the Explorer into a broken state. You'll need to refresh the page to get it working again.",
        stateProp: 'brokenExplorerState',
      },
      'Use new Markdown engine?': {
        description: null,
        stateProp: 'useNewMarkdownEngine',
      },
    };

    return (
      <div className="api-experiments">
        <ul>
          {Object.keys(experiments).map(name => {
            const experiment = experiments[name];

            return (
              <li key={name}>
                <input
                  checked={this.state[experiment.stateProp]}
                  name={experiment.stateProp}
                  onChange={e => {
                    this.setState({ [experiment.stateProp]: e.target.checked });
                    this.forceUpdate();
                  }}
                  type="checkbox"
                />
                <label htmlFor={experiment.stateProp} title={experiment.description}>
                  {name}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    const { fetchSwagger, status, docs, oas, oasUrl, oauth } = this.props;
    const { brokenExplorerState, maskErrorMessages, useNewMarkdownEngine } = this.state;

    const additionalProps = {
      oasFiles: {
        'demo-api-setting': Object.assign(extensions.defaults, oas),
      },
      oasUrls: {
        'demo-api-setting': oasUrl,
      },
    };

    if (brokenExplorerState) {
      delete additionalProps.oasFiles;
    }

    return (
      <div>
        <div className="api-list-header">
          <ApiList fetchSwagger={fetchSwagger} />

          {status.length > 0 ? <pre>{status.join('\n')}</pre> : this.experimentToggles()}
        </div>

        {status.length === 0 && (
          <ApiExplorer
            {...additionalProps}
            // Uncomment this in for column layout
            // appearance={{ referenceLayout: 'column' }}
            appearance={{ referenceLayout: 'row' }}
            // Uncomment this if you want to test enterprise-structured URLs
            // baseUrl={'/child/v1.0'}
            baseUrl="/"
            // To test the top level error boundary, uncomment this
            // docs={[null, null]}
            docs={docs}
            // We only really set this to `true` for testing sites for errors using puppeteer
            dontLazyLoad={false}
            flags={{ correctnewlines: false }}
            glossaryTerms={[{ term: 'apiKey', definition: 'This is a definition' }]}
            Logs={Logs}
            maskErrorMessages={maskErrorMessages}
            oauth={oauth}
            suggestedEdits
            useNewMarkdownEngine={useNewMarkdownEngine}
            variables={{
              // Uncomment this to test without logs
              // user: {}
              // Uncomment this to test with logs
              // user: {
              //   keys: [
              //     { id: 'someid', name: 'project1', apiKey: '123' },
              //     { id: 'anotherid', name: 'project2', apiKey: '456' },
              //   ],
              // },
              // Uncomment this to test without keys array
              // user: { user: '123456', pass: 'abc', apiKey: '123456' },
              user: {
                keys: [
                  { id: 'asdfghjkl', name: 'project1', apiKey: '123', user: 'user1', pass: 'pass1' },
                  { id: 'zxcvbnm', name: 'project2', apiKey: '456', user: 'user2', pass: 'pass2' },
                ],
              },
              defaults: [],
            }}
          />
        )}
      </div>
    );
  }
}

Demo.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.shape).isRequired,
  fetchSwagger: PropTypes.func.isRequired,
  oas: PropTypes.shape({}).isRequired,
  oasUrl: PropTypes.string.isRequired,
  oauth: PropTypes.bool,
  status: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Demo.defaultProps = {
  oauth: false,
};

module.exports = withSpecFetching(Demo);
