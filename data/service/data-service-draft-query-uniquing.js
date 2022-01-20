{

    _pendingStreamsForQueryEqualsToQuery: {
        value: function(aQuery) {
            if(!aQuery) {
                return null;
            }

            var _pendingStreamsByQuery = this._pendingStreamsByQueryByObjectDescriptor.get(aQuery.type);

            if(!_pendingStreamsByQuery) {
                return null;
            }

            var queryIterator  = _pendingStreamsByQuery.keys(),
                iQuery;

            while ((iQuery = queryIterator.next().value)) {
                if(aQuery.equals(iQuery)) {
                    return _pendingStreamsByQuery.get(iQuery);
                }
            }

            return null;
        }
    },
    _addPendingStreamForQuery: {
        value: function(aStream, aQuery) {
            var streams = this._pendingStreamsForQueryEqualsToQuery(aQuery);

            if(streams) {
                streams.push(aStream);
            } else {
                var _pendingStreamsByQuery = this._pendingStreamsByQueryByObjectDescriptor.get(aQuery.type);

                if(!_pendingStreamsByQuery) {
                    _pendingStreamsByQuery = new Map();
                    this._pendingStreamsByQueryByObjectDescriptorsget(aQuery.type,_pendingStreamsByQuery);
                }
                _pendingStreamsByQuery.set(aQuery,[aStream]);
            }
        }
    },
    /*
        remove all streams for a query
    */
    _removePendingStreamsForQuery: {
        value: function(aQuery) {
            var _pendingStreamsByQuery = this._pendingStreamsByQueryByObjectDescriptor.get(aQuery.type),
                iQuery = aQuery,
                streams;

            if(!_pendingStreamsByQuery) {
                return;
            }

            streams = _pendingStreamsByQuery.get(iQuery);
            /*
                no luck, it wasn't the original one. Loop to find it:
            */
            if(!streams) {
                var queryIterator  = _pendingStreamsByQuery.keys();

                while ((iQuery = queryIterator.next().value)) {
                    if(aQuery.equals(iQuery)) {
                        streams =  _pendingStreamsByQuery.get(iQuery);
                        break;
                    }
                }
            }

            //Not sure if we need to remove these here yet...

            _pendingStreamsByQuery.delete(iQuery);
        }
    },

    /***************************************************************************
     * Fetching Data
     */

    /**
     * Fetch data from the service using its child services.
     *
     * This method accept [types]{@link DataObjectDescriptor} as alternatives to
     * [queries]{@link DataQuery}, and its [stream]{DataStream} argument is
     * optional, but when it calls its child services it will provide them with
     * a [query]{@link DataQuery}, it provide them with a
     * [stream]{DataStream}, creating one if necessary, and the stream will
     * include a reference to the query. Also, if a child service's
     * implementation of this method return `undefined` or `null`, this method
     * will return the stream passed in to the call to that child.
     *
     * The requested data may be fetched asynchronously, in which case the data
     * stream will be returned immediately but the stream's data will be added
     * to the stream at a later time.
     *
     * @method
     * @argument {DataQuery|DataObjectDescriptor|ObjectDescriptor|Function|String}
     *           queryOrType   - If this argument's value is a query
     *                              it will define what type of data should
     *                              be returned and what criteria that data
     *                              should satisfy. If the value is a type
     *                              it will only define what type of data
     *                              should be returned, and the criteria
     *                              that data should satisfy can be defined
     *                              using the `criteria` argument.  A type
     *                              is defined as either a DataObjectDesc-
     *                              riptor, an Object Descriptor, a Construct-
     *                              or the string module id.  The method will
     *                              convert the passed in type to a Data-
     *                              ObjectDescriptor (deprecated) or an
     *                              ObjectDescriptor.  This is true whether
     *                              passing in a DataQuery or a type.
     * @argument {?Object}
     *           optionalCriteria - If the first argument's value is a
     *                              type this argument can optionally be
     *                              provided to defines the criteria which
     *                              the returned data should satisfy.
     *                              If the first argument's value is a
     *                              query this argument should be
     *                              omitted and will be ignored if it is
     *                              provided.
     * @argument {?DataStream}
     *           optionalStream   - The stream to which the provided data
     *                              should be added. If no stream is
     *                              provided a stream will be created and
     *                              returned by this method.
     * @returns {?DataStream} - The stream to which the fetched data objects
     * were or will be added, whether this stream was provided to or created by
     * this method.
     */
    fetchData: {
        value: function (queryOrType, optionalCriteria, optionalStream) {
            var self = this,
                isSupportedType = !(queryOrType instanceof DataQuery),
                type = isSupportedType && queryOrType,
                criteria = optionalCriteria instanceof DataStream ? undefined : optionalCriteria,
                query = type ? DataQuery.withTypeAndCriteria(type, criteria) : queryOrType,
                _optionalStream = optionalCriteria instanceof DataStream ? optionalCriteria : optionalStream,
                stream;

            // make sure type is an object descriptor or a data object descriptor.
            query.type = this.objectDescriptorForType(query.type);

            /*
                Check if we may have a similar query in-flight
            */
           var streams = this._pendingStreamsForQueryEqualsToQuery(query);
           if(streams && streams.length > 0) {
                /*
                    If we don't have an optionalStream passed by the caller, we should use the first one in streamSet.
                */
                if(!_optionalStream) {
                    return streams[0];
                } else {
                    streams.push(_optionalStream);
                    return _optionalStream;
                }
           } else {
                // Set up the stream.
                stream = _optionalStream || new DataStream();
                stream.query = query;
                stream.dataExpression = query.selectExpression;

                /*
                    We didn't found an equivalent query, so we're going to register this one:
                */
                this._addPendingStreamForQuery(stream,query);
           }




            this._dataServiceByDataStream.set(stream, this._childServiceRegistrationPromise.then(function() {
                var service;
                //This is a workaround, we should clean that up so we don't
                //have to go up to answer that question. The difference between
                //.TYPE and Objectdescriptor still creeps-in when it comes to
                //the service to answer that to itself
                if (self.parentService && self.parentService.childServiceForType(query.type) === self && typeof self.fetchRawData === "function") {
                    service = self;
                    service._fetchRawData(stream);
                } else {

                    // Use a child service to fetch the data.
                    try {

                        service = self.childServiceForType(query.type);
                        if (service) {
                            //Here we end up creating an extra stream for nothing because it should be third argument.
                            stream = service.fetchData(query, stream) || stream;
                            self._dataServiceByDataStream.set(stream, service);
                        } else {
                            throw new Error("Can't fetch data of unknown type - " + (query.type.typeName || query.type.name) + "/" + query.type.uuid);
                        }
                    } catch (e) {
                        stream.dataError(e);
                    }
                }

                return service;
            }));
            // Return the passed in or created stream.
            return stream;
        }
    }
}
