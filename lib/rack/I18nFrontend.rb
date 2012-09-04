require 'psych'

module Rack

  # A rack app for intersepting requests.
  # Full-page responses from the app get the i18n-frontend assets added to it.
  # Requests meant for i18n-frontend-rackapp are caught here.
  class I18nFrontend

    def initialize(app)
      @app = app
    end
    
    # Rack tie, Respond to requests
    def call(env)
      request = Rack::Request.new(env)

      if i18nfrontend?(request)
        # handle request if it's for i18nfrontend
        status, headers, response = handle(request)
      else
        # pass request to application
        status, headers, response = @app.call(env)
      end

      # insert scripts and styles if html request
      if html?(headers) #&& !redirect(headers)
        insert_scripts(response) unless request.xhr?# || response.respond_to?(:location) && !response.location.nil?
      end

      [status, headers, response]
    end

    # insert scripts and styles to the given response object
    def insert_scripts(response)
      scripts = "<script src='/i18nfrontend/jquery.i18nfrontendOverlay.js'></script>" + 
                "<script src='/i18nfrontend/jquery.i18nfrontend.js'></script>"
      styles = "<link href='/i18nfrontend/i18nfrontend.css' type='text/css' rel='stylesheet'>"
      response.each{|body|
        body.gsub!("</head>", styles + "</head>") unless body.nil?
        body.gsub!("</html>", scripts + "</html>") unless body.nil?
      }
    end

    # Handle request meant for i18n-frontend rack-app
    def handle(request)

      case request.path

      # respond with proper assets, when one is requested
      when "/i18nfrontend/i18nfrontend.css"
        [200, {"Content-Type" => "text/css"}, [get_file('i18nfrontend.css')]]
      when "/i18nfrontend/jquery.i18nfrontend.js"
        [200, {"Content-Type" => "text/javascript"}, [get_file('jquery.i18nfrontend.js')]]
      when "/i18nfrontend/jquery.i18nfrontendOverlay.js"
        [200, {"Content-Type" => "text/javascript"}, [get_file('jquery.i18nfrontendOverlay.js')]]

      # save translation
      when "/i18nfrontend/save"
        begin
          [200, {}, [save(request)]]
        rescue Exception => e
          [500, {}, [e.message]]
        end
      
      # if we're here, something didn't go right
      else
        [404, {}, ["Not Found"]]
      end

    end



    private

      # read file from the assets folder
      def get_file(file)
        ::File.read("#{Pathname.new(__FILE__).dirname}/../assets/#{file}")
      end

      # check if the request was meant for the app or i18n-frontend rack-app
      def i18nfrontend?(request)
        request && request.path && request.path.include?("i18nfrontend")
      end

      # Check if the response type is html
      def html?(headers)
        headers && headers["Content-Type"] && headers["Content-Type"].include?("text/html")
      end

      # Save the given text to the given key on the g
      def save(request)

        file = locate_best_file(request)
        yml = Psych.load_file(file) || {}
        keys = request.params['key'].split(".")
        
        puts request.params['value']
        puts URI.unescape(request.params['value'])
        puts CGI::unescape_html(request.params['value'])

        cur_hash = yml
        keys.each_with_index {|k, i|
          last = i == keys.size-1
          cur_hash[k] = {} unless cur_hash.has_key?(k)
          cur_hash[k] = CGI::unescape_html(request.params['value']) if last
          cur_hash = cur_hash[k]
          if cur_hash.class != Hash
            raise "key already occupied" unless last
            break
          end
        }

        f = ::File.new(file, 'w+')
        f.write Psych.dump(yml).gsub(/^-+/, "")
        f.close
        file

      end

      # Locate the best guess for a file, where the translation should be stored.
      # The result is affected by 'which file has a key that matches best with the given key?'
      def locate_best_file(request)

        config_path = Pathname.new(APP_PATH).dirname.to_s
        load_paths = I18n.load_path.select{|path| path.include?(config_path)}
        keys = request.params['key'].split(".")
        best_file = config_path + "/locales/en.yml"
        best_depth = 0

        load_paths.each {|path|
          yml = Psych.load_file path
          depth = 0
          keys.each {|k|
            break if yml.class != Hash
            break unless yml.has_key?(k)
            depth += 1
            yml = yml[k]
            if depth > best_depth
              best_file = path 
              best_depth = depth
            end
          }
        }

        best_file
      end

  end

end
