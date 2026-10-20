FROM redgate/flyway:13.6.0@sha256:8a18f15fb16fd54bd560949650d1d2a68f36e3b3fdf3f92c3088c45aae220bca
USER root
COPY entrypoint.sh /opt/sorveteria/entrypoint.sh
RUN chmod 0555 /opt/sorveteria/entrypoint.sh
ENTRYPOINT ["/bin/sh", "/opt/sorveteria/entrypoint.sh"]
CMD ["apply"]
